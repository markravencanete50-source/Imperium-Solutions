import Link from "next/link";
import { industries } from "@/lib/content";
import { SectionHead, delay } from "./bits";
import { Icon } from "./icons";
import DetailCard from "./DetailCard";

/** Every industry as a tile in the grid: a photograph, the name, and the work we run there. */
export default function Industries({ compact = false }: { compact?: boolean }) {
  return (
    <section className="band band--raise" id="industries" aria-labelledby="industries-title">
      <div className="wrap">
        <SectionHead
          id="industries-title"
          title="Every industry accepted"
          lede="The model stays the same whatever you sell. Delivered means work on record. Supported means typical work we scope with you."
        />
        <ul className={`plain ind-grid${compact ? " ind-grid--compact" : ""}`}>
          {industries.map((ind, i) => {
            const face = (
              <>
                <div className="ind-ph" role="img" aria-label={`${ind.name} photograph`}>
                  <div className="ind-img" style={{ backgroundImage: ind.image }} />
                </div>
                <div className="ind-body">
                  <span className={`ind-tag ind-tag--${ind.tag.toLowerCase()}`}>{ind.tag}</span>
                  <h3>{ind.name}</h3>
                  {compact ? null : <p>{ind.desc}</p>}
                </div>
              </>
            );
            return (
              <li key={ind.key} className="ind-li">
                {compact ? (
                  <DetailCard
                    className="ind"
                    style={delay((i % 4) * 80)}
                    eyebrow={ind.tag === "Delivered" ? "Delivered: work on record" : "Supported: typical work we scope with you"}
                    title={ind.name}
                    more="Read more"
                    tile={face}
                  >
                    <div className="modal-photo" style={{ backgroundImage: ind.image }} role="img" aria-label={`${ind.name} photograph`} />
                    <p className="modal-lede">{ind.desc}</p>
                    <div className="actions">
                      <Link className="btn btn--amber" href="/contact">
                        Book a 15 minute consultation
                      </Link>
                      <Link className="btn btn--ghost" href="/industries">
                        All industries
                      </Link>
                    </div>
                  </DetailCard>
                ) : (
                  <div className="ind tile" data-reveal="" style={delay((i % 4) * 80)}>
                    {face}
                  </div>
                )}
              </li>
            );
          })}
          <li className="ind ind--cta tile" data-reveal="" style={delay(240)}>
            <div className="ind-body">
              <Icon name="plus" size={30} />
              <h3>Your industry</h3>
              <p>Not on the list? Tell us the work and we will scope it.</p>
              <Link className="btn btn--amber btn--small" href="/contact">
                Book a consultation
              </Link>
            </div>
          </li>
        </ul>
        {compact ? (
          <p className="after-table" data-reveal="">
            <Link className="textlink" href="/industries">
              See the work we run in each industry
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
