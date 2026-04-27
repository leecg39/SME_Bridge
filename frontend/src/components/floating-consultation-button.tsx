import Link from "next/link";
import { PhoneCall } from "lucide-react";

export function FloatingConsultationButton() {
  return (
    <Link className="button button-primary floating" href="/consultation">
      <PhoneCall aria-hidden="true" size={22} />
      <span>전문가 상담</span>
    </Link>
  );
}
