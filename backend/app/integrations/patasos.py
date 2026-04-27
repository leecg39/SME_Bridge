from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional

import httpx


@dataclass(frozen=True)
class PatasosSettings:
    base_url: str
    company_id: str
    triage_agent_id: Optional[str]
    service_email: str
    service_password: str

    @classmethod
    def from_env(cls) -> Optional["PatasosSettings"]:
        base_url = os.getenv(
            "PATASOS_BASE_URL",
            "https://paperclip-829m.srv1607352.hstgr.cloud",
        ).strip()
        company_id = os.getenv("PATASOS_COMPANY_ID", "").strip()
        service_email = os.getenv("PATOSOS_SERVICE_EMAIL", "").strip() or os.getenv(
            "PATASOS_SERVICE_EMAIL", ""
        ).strip()
        service_password = os.getenv("PATOSOS_SERVICE_PASSWORD", "").strip() or os.getenv(
            "PATASOS_SERVICE_PASSWORD", ""
        ).strip()
        triage_agent_id = os.getenv("PATASOS_TRIAGE_AGENT_ID", "").strip() or None

        if not (base_url and company_id and service_email and service_password):
            return None

        return cls(
            base_url=base_url,
            company_id=company_id,
            triage_agent_id=triage_agent_id,
            service_email=service_email,
            service_password=service_password,
        )


@dataclass(frozen=True)
class PatasosIssue:
    issue_id: str
    identifier: Optional[str]
    url: str


class PatasosError(RuntimeError):
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class PatasosClient:
    def __init__(
        self,
        settings: PatasosSettings,
        transport: Optional[httpx.AsyncBaseTransport] = None,
        timeout_seconds: float = 15.0,
    ):
        self.settings = settings
        self.transport = transport
        self.timeout_seconds = timeout_seconds

    async def create_issue(
        self,
        *,
        title: str,
        description: str,
        idempotency_key: str,
    ) -> PatasosIssue:
        async with httpx.AsyncClient(
            base_url=self.settings.base_url.rstrip("/"),
            follow_redirects=True,
            timeout=self.timeout_seconds,
            transport=self.transport,
        ) as client:
            await self._sign_in(client)
            response = await self._post_issue(client, title, description, idempotency_key)
            if response.status_code == 401:
                await self._sign_in(client)
                response = await self._post_issue(client, title, description, idempotency_key)

            if response.status_code >= 400:
                raise PatasosError(
                    self._error_message(response),
                    status_code=response.status_code,
                )

            body = response.json()
            issue_id = str(body.get("id") or body.get("issueId") or "")
            if not issue_id:
                raise PatasosError("Patasos did not return an issue id")
            identifier = body.get("identifier")
            issue_ref = str(identifier or issue_id)
            return PatasosIssue(
                issue_id=issue_id,
                identifier=str(identifier) if identifier else None,
                url=f"{self.settings.base_url.rstrip('/')}/issues/{issue_ref}",
            )

    async def _sign_in(self, client: httpx.AsyncClient) -> None:
        response = await client.post(
            "/api/auth/sign-in/email",
            json={
                "email": self.settings.service_email,
                "password": self.settings.service_password,
            },
        )
        if response.status_code >= 400:
            raise PatasosError(
                self._error_message(response),
                status_code=response.status_code,
            )

    async def _post_issue(
        self,
        client: httpx.AsyncClient,
        title: str,
        description: str,
        idempotency_key: str,
    ) -> httpx.Response:
        payload = {
            "title": title,
            "description": description,
            "status": "todo",
            "priority": "medium",
        }
        if self.settings.triage_agent_id:
            payload["assigneeAgentId"] = self.settings.triage_agent_id

        return await client.post(
            f"/api/companies/{self.settings.company_id}/issues",
            json=payload,
            headers={"Idempotency-Key": idempotency_key},
        )

    @staticmethod
    def _error_message(response: httpx.Response) -> str:
        try:
            body = response.json()
        except ValueError:
            return response.text or f"Patasos request failed: {response.status_code}"

        if isinstance(body, dict):
            error = body.get("error")
            if isinstance(error, dict):
                return str(error.get("message") or error)
            if error:
                return str(error)
        return f"Patasos request failed: {response.status_code}"
