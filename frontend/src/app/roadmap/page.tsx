"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

import { FloatingConsultationButton } from "@/components/floating-consultation-button";
import { getMnaDocuments } from "@/lib/api";
import {
  buildMnaRoadmapHeaderSummary,
  MNA_ROADMAP_TASK_CHECKLIST_STORAGE_KEY,
  mnaRoadmapPhases,
  parseMnaRoadmapTaskChecklist,
  serializeMnaRoadmapTaskChecklist,
  type MnaRoadmapPhase,
} from "@/lib/mna-documents";

export default function RoadmapPage() {
  const [phases, setPhases] = useState<MnaRoadmapPhase[]>(mnaRoadmapPhases);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [isChecklistLoaded, setIsChecklistLoaded] = useState(false);
  const roadmapHeaderSummary = buildMnaRoadmapHeaderSummary(checked, phases);

  useEffect(() => {
    setChecked(
      parseMnaRoadmapTaskChecklist(
        window.localStorage.getItem(MNA_ROADMAP_TASK_CHECKLIST_STORAGE_KEY),
      ),
    );
    setIsChecklistLoaded(true);
    getMnaDocuments()
      .then((items) => {
        if (items.length > 0) setPhases(items);
      })
      .catch(() => setPhases(mnaRoadmapPhases));
  }, []);

  useEffect(() => {
    if (!isChecklistLoaded) return;
    window.localStorage.setItem(
      MNA_ROADMAP_TASK_CHECKLIST_STORAGE_KEY,
      serializeMnaRoadmapTaskChecklist(checked),
    );
  }, [checked, isChecklistLoaded]);

  function toggle(key: string) {
    setChecked((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section className="page">
      <div className="roadmap-title-row">
        <div>
          <h1 className="page-title">매각 로드맵</h1>
          <p className="lead">{roadmapHeaderSummary.detailLabel}</p>
        </div>
        <Link className="button button-secondary" href="/consultation?type=mna">
          M&A 자문 요청
        </Link>
      </div>
      <div className="kanban">
        {phases.map((phase) => (
          <div className="card phase-card" key={phase.phase}>
            <h2>
              Phase {phase.phase}. {phase.name}
            </h2>
            <p>{phase.duration}</p>
            {phase.tasks.map((task) => {
              const key = `${phase.phase}-${task}`;
              return (
                <label className="checkbox-row" key={key}>
                  <input
                    checked={Boolean(checked[key])}
                    type="checkbox"
                    onChange={() => toggle(key)}
                  />
                  {task}
                </label>
              );
            })}
            <div className="phase-document-panel">
              <div className="phase-document-title">
                <Download aria-hidden="true" size={18} />
                필요 서류 PDF
                <span>{phase.documents.length}개</span>
              </div>
              <div className="phase-document-list">
                {phase.documents.map((document) => (
                  <a
                    className="document-download"
                    download
                    href={document.file_path}
                    key={document.document_key}
                  >
                    <span>
                      <strong>{document.title}</strong>
                      <small>{document.description}</small>
                    </span>
                    <em>PDF</em>
                    <Download aria-hidden="true" size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <FloatingConsultationButton />
    </section>
  );
}
