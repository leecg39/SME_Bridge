from __future__ import annotations

from pathlib import Path
from textwrap import dedent

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_DIR = ROOT / "frontend" / "public" / "templates"
OUTPUT_DIR = TEMPLATE_DIR / "ma-pdf"

SOURCE_FILES = {
    "phase-1-strategy-brief": TEMPLATE_DIR / "ma" / "phase-1-strategy-brief.md",
    "phase-1-synergy-hypothesis": TEMPLATE_DIR / "ma" / "phase-1-synergy-hypothesis.md",
    "phase-1-approval-memo": TEMPLATE_DIR / "ma" / "phase-1-approval-memo.md",
    "phase-2-target-screening-matrix": TEMPLATE_DIR / "ma" / "phase-2-target-screening-matrix.md",
    "phase-2-target-approach-log": TEMPLATE_DIR / "ma" / "phase-2-target-approach-log.md",
    "phase-3-data-room-index": TEMPLATE_DIR / "ma" / "phase-3-data-room-index.md",
    "phase-3-red-flag-log": TEMPLATE_DIR / "ma" / "phase-3-red-flag-log.md",
    "phase-3-valuation-workbook-checklist": TEMPLATE_DIR / "ma" / "phase-3-valuation-workbook-checklist.md",
    "phase-4-spa-key-terms-checklist": TEMPLATE_DIR / "ma" / "phase-4-spa-key-terms-checklist.md",
    "phase-4-disclosure-schedule-tracker": TEMPLATE_DIR / "ma" / "phase-4-disclosure-schedule-tracker.md",
    "phase-5-pmi-100-day-plan": TEMPLATE_DIR / "ma" / "phase-5-pmi-100-day-plan.md",
    "phase-5-day-1-communication-plan": TEMPLATE_DIR / "ma" / "phase-5-day-1-communication-plan.md",
    "phase-5-integration-workstream-tracker": TEMPLATE_DIR / "ma" / "phase-5-integration-workstream-tracker.md",
}

OVERRIDES = {
    "nda-template": """
        # NDA 양식

        본 양식은 참고용이며 실제 거래에서는 회계, 세무, 법률 전문가 검토가 필요합니다.

        ## 기본 정보

        | 항목 | 내용 |
        | --- | --- |
        | 정보 제공자 |  |
        | 정보 수령자 |  |
        | 검토 목적 | M&A 검토 및 예비 실사 |
        | 유효 기간 |  |
        | 비밀유지 기간 |  |

        ## 핵심 조항 점검

        | 조항 | 확인 | 비고 |
        | --- | --- | --- |
        | 비밀정보 범위 |  |  |
        | 사용 목적 제한 |  |  |
        | 임직원 및 자문사 공유 범위 |  |  |
        | 자료 복제 및 저장 제한 |  |  |
        | 자료 반환 또는 폐기 |  |  |
        | 손해배상 및 관할 |  |  |

        ## 승인

        | 검토자 | 의견 | 완료일 |
        | --- | --- | --- |
        | 내부 담당자 |  |  |
        | 법무/외부 변호사 |  |  |
    """,
    "loi-template": """
        # LOI 양식

        본 양식은 참고용이며 실제 거래에서는 회계, 세무, 법률 전문가 검토가 필요합니다.

        ## 거래 개요

        | 항목 | 내용 |
        | --- | --- |
        | 대상 회사 |  |
        | 거래 구조 | 주식양수도 / 자산양수도 / 합병 / 기타 |
        | 예상 거래 금액 |  |
        | 가격 산정 방식 |  |
        | 실사 기간 |  |

        ## 주요 조건

        | 조건 | 초안 | 협상 메모 |
        | --- | --- | --- |
        | 독점 협상권 |  |  |
        | 실사 범위 |  |  |
        | 가격 조정 방식 |  |  |
        | 선행조건 |  |  |
        | 구속/비구속 조항 |  |  |

        ## 미결 이슈

        | 이슈 | 중요도 | 담당 | 해결 기한 |
        | --- | --- | --- | --- |
        |  | 높음 / 중간 / 낮음 |  |  |
    """,
    "dd-request-list": """
        # 실사 요청자료 목록

        본 양식은 참고용이며 실제 거래에서는 회계, 세무, 법률 전문가 검토가 필요합니다.

        ## 요청자료 현황

        | 영역 | 자료명 | 기간 | 담당 | 상태 |
        | --- | --- | --- | --- | --- |
        | 재무 | 감사보고서/재무제표 | 최근 3~5년 |  | 요청 |
        | 세무 | 법인세 신고서 | 최근 3~5년 |  | 요청 |
        | 법률 | 주요 계약서 | 유효 계약 전체 |  | 요청 |
        | 인사 | 임직원 현황 및 급여대장 | 최근 1년 |  | 요청 |
        | 영업 | 고객별 매출 자료 | 최근 3년 |  | 요청 |
        | IT | 시스템 구성도와 라이선스 | 현재 |  | 요청 |

        ## 보완 요청

        | 자료명 | 보완 내용 | 요청일 | 완료일 |
        | --- | --- | --- | --- |
        |  |  |  |  |
    """,
    "closing-day-checklist": """
        # Closing 체크리스트

        본 양식은 참고용이며 실제 거래에서는 회계, 세무, 법률 전문가 검토가 필요합니다.

        ## 선행조건

        | 조건 | 담당 | 증빙 | 완료일 | 상태 |
        | --- | --- | --- | --- | --- |
        | 이사회/주주 승인 |  |  |  |  |
        | 규제 신고 또는 승인 |  |  |  |  |
        | 주요 계약 동의 |  |  |  |  |
        | 자금 조달 확정 |  |  |  |  |
        | 최종 실사 이슈 해소 |  |  |  |  |

        ## Closing Day

        | 시간 | 작업 | 담당 | 확인 |
        | --- | --- | --- | --- |
        |  | 서명본 교환 |  |  |
        |  | 대금 지급 |  |  |
        |  | 주식/자산 이전 |  |  |
        |  | 공시/통지 |  |  |
    """,
    "employee-transfer-plan": """
        # 직원 승계 계획서

        본 양식은 참고용이며 실제 거래에서는 회계, 세무, 법률 전문가 검토가 필요합니다.

        ## 핵심 인력 현황

        | 이름/직무 | 승계 중요도 | 유지 방안 | 커뮤니케이션 담당 |
        | --- | --- | --- | --- |
        |  | 높음 / 중간 / 낮음 |  |  |

        ## 고용 조건

        | 항목 | 현행 | 변경 여부 | 비고 |
        | --- | --- | --- | --- |
        | 근로계약 |  |  |  |
        | 급여/상여 |  |  |  |
        | 복리후생 |  |  |  |
        | 인센티브 |  |  |  |

        ## 커뮤니케이션 일정

        | 일자 | 대상 | 메시지 | 전달자 |
        | --- | --- | --- | --- |
        |  | 임직원 전체 |  |  |
        |  | 핵심 인력 |  |  |
    """,
}


def build_styles() -> dict[str, ParagraphStyle]:
    pdfmetrics.registerFont(UnicodeCIDFont("HYGothic-Medium"))
    pdfmetrics.registerFont(UnicodeCIDFont("HYSMyeongJo-Medium"))
    styles = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "TitleKo",
            parent=styles["Title"],
            fontName="HYGothic-Medium",
            fontSize=22,
            leading=28,
            textColor=colors.HexColor("#08275e"),
            spaceAfter=12,
        ),
        "heading": ParagraphStyle(
            "HeadingKo",
            parent=styles["Heading2"],
            fontName="HYGothic-Medium",
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#123f8c"),
            spaceBefore=12,
            spaceAfter=8,
        ),
        "body": ParagraphStyle(
            "BodyKo",
            parent=styles["BodyText"],
            fontName="HYSMyeongJo-Medium",
            fontSize=10,
            leading=15,
            textColor=colors.HexColor("#182230"),
            spaceAfter=6,
        ),
        "cell": ParagraphStyle(
            "CellKo",
            parent=styles["BodyText"],
            fontName="HYSMyeongJo-Medium",
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#182230"),
        ),
        "footer": ParagraphStyle(
            "FooterKo",
            parent=styles["BodyText"],
            fontName="HYGothic-Medium",
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#485568"),
        ),
    }


def parse_table(lines: list[str], start: int) -> tuple[list[list[str]], int]:
    rows: list[list[str]] = []
    index = start
    while index < len(lines) and lines[index].strip().startswith("|"):
        parts = [part.strip() for part in lines[index].strip().strip("|").split("|")]
        if not all(part.replace("-", "").replace(":", "").strip() == "" for part in parts):
            rows.append(parts)
        index += 1
    return rows, index


def table_flowable(rows: list[list[str]], styles: dict[str, ParagraphStyle], width: float) -> Table:
    cell_rows = [[Paragraph(cell or " ", styles["cell"]) for cell in row] for row in rows]
    column_count = max(len(row) for row in rows)
    for row in cell_rows:
        while len(row) < column_count:
            row.append(Paragraph(" ", styles["cell"]))
    table = Table(cell_rows, colWidths=[width / column_count] * column_count, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eef5ff")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#08275e")),
                ("FONTNAME", (0, 0), (-1, 0), "HYGothic-Medium"),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#d8d2ca")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def markdown_to_story(markdown: str, styles: dict[str, ParagraphStyle], width: float) -> list[object]:
    story: list[object] = []
    lines = [line.rstrip() for line in dedent(markdown).strip().splitlines()]
    index = 0
    while index < len(lines):
        line = lines[index].strip()
        if not line:
            index += 1
            continue
        if line.startswith("|"):
            rows, index = parse_table(lines, index)
            if rows:
                story.append(table_flowable(rows, styles, width))
                story.append(Spacer(1, 8))
            continue
        if line.startswith("# "):
            story.append(Paragraph(line[2:].strip(), styles["title"]))
        elif line.startswith("## "):
            story.append(Paragraph(line[3:].strip(), styles["heading"]))
        elif line.startswith("- "):
            story.append(Paragraph(f"• {line[2:].strip()}", styles["body"]))
        else:
            story.append(Paragraph(line, styles["body"]))
        index += 1
    story.append(Spacer(1, 12))
    story.append(Paragraph("승계브릿지 SME Bridge · PDF 양식", styles["footer"]))
    return story


def render_pdf(document_key: str, markdown: str, styles: dict[str, ParagraphStyle]) -> None:
    output_path = OUTPUT_DIR / f"{document_key}.pdf"
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
        title=document_key,
        author="SME Bridge",
    )
    story = markdown_to_story(markdown, styles, doc.width)
    doc.build(story)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    styles = build_styles()
    for document_key, path in SOURCE_FILES.items():
        render_pdf(document_key, path.read_text(encoding="utf-8"), styles)
    for document_key, markdown in OVERRIDES.items():
        render_pdf(document_key, markdown, styles)
    print(f"Generated {len(SOURCE_FILES) + len(OVERRIDES)} PDFs in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
