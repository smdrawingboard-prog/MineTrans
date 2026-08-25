const C = {
  onyx: "#0A0A0B",
  charcoal: "#1E1D20",
  graphite: "#3A383D",
  platinum: "#C9CACE",
  copper: "#AD6A3D",
  copperBright: "#C9854F",
  bone: "#F7F5F1",
  line: "rgba(201,202,206,.14)",
  lineCopper: "rgba(173,106,61,.4)",
};

const sf = "'Jost',sans-serif";
const bf = "'Inter',sans-serif";
const df = "'Playfair Display',serif";
const mf = "'IBM Plex Mono',monospace";

function Eyebrow({ children }: { children: string }) {
  return (
    <div
      style={{
        fontFamily: sf,
        fontWeight: 400,
        fontSize: 12,
        letterSpacing: ".38em",
        textTransform: "uppercase",
        color: C.copperBright,
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 22,
        justifyContent: "center",
      }}
    >
      <span style={{ width: 34, height: 1, background: C.copper, display: "inline-block" }} />
      {children}
    </div>
  );
}

function CtaButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: sf,
        fontSize: 12.5,
        letterSpacing: ".2em",
        textTransform: "uppercase",
        fontWeight: 600,
        color: C.onyx,
        background: C.copper,
        border: 0,
        borderRadius: 2,
        padding: "16px 36px",
        cursor: "pointer",
        transition: "background .2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = C.copperBright)}
      onMouseLeave={e => (e.currentTarget.style.background = C.copper)}
    >
      {children}
    </button>
  );
}

function StatCard({ value, label, desc }: { value: string; label: string; desc: string }) {
  return (
    <div
      style={{
        background: C.charcoal,
        border: `1px solid ${C.line}`,
        borderRadius: 4,
        padding: "28px 24px",
      }}
    >
      <div style={{ fontFamily: mf, fontWeight: 400, fontSize: 40, color: C.copperBright, letterSpacing: "-.01em" }}>
        {value}
      </div>
      <h3 style={{ fontFamily: sf, fontWeight: 600, fontSize: 16, color: C.bone, margin: "14px 0 8px" }}>{label}</h3>
      <p style={{ fontFamily: bf, fontSize: 14, color: C.platinum, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function SyllabusCard({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div style={{ background: C.charcoal, border: `1px solid ${C.line}`, borderRadius: 4, padding: "28px 26px" }}>
      <h4 style={{ fontFamily: sf, fontWeight: 600, fontSize: 17, color: C.copperBright, marginBottom: 18 }}>
        {heading}
      </h4>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map(item => (
          <li
            key={item}
            style={{
              position: "relative",
              paddingLeft: 20,
              marginBottom: 10,
              fontFamily: bf,
              fontSize: 14.5,
              color: C.platinum,
              lineHeight: 1.6,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                top: ".55em",
                width: 7,
                height: 7,
                background: C.copper,
                transform: "rotate(45deg)",
              }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <h4 style={{ fontFamily: sf, fontWeight: 600, fontSize: 15, color: C.copperBright, marginBottom: 8 }}>{q}</h4>
      <p style={{ fontFamily: bf, fontSize: 14.5, color: C.platinum, lineHeight: 1.65 }}>{a}</p>
    </div>
  );
}

export default function CertificationLanding() {
  return (
    <div style={{ minHeight: "100vh", background: C.onyx, color: C.platinum, fontFamily: bf, fontWeight: 300 }}>
      {/* Nav */}
      <nav
        style={{
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px clamp(20px,5vw,64px)",
        }}
      >
        <span style={{ fontFamily: sf, fontSize: 15, letterSpacing: ".05em", fontWeight: 500, color: C.bone }}>
          MineTrans
        </span>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <button
            onClick={() => (window.location.href = "/certification/admin/login")}
            style={{
              background: "none",
              border: 0,
              cursor: "pointer",
              fontFamily: sf,
              fontSize: 12,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: C.platinum,
            }}
          >
            Admin
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              background: "none",
              border: 0,
              cursor: "pointer",
              fontFamily: sf,
              fontSize: 12,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: C.platinum,
            }}
          >
            Back to Website
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 28px 96px", textAlign: "center" }}>
        <Eyebrow>MineTrans Certification Program</Eyebrow>
        <h1
          style={{
            fontFamily: df,
            fontWeight: 600,
            fontSize: "clamp(2.125rem, 5.4vw, 4rem)",
            lineHeight: 1.1,
            color: C.bone,
            margin: "0 0 26px",
          }}
        >
          Become a certified <em style={{ fontStyle: "italic", color: C.copperBright }}>mining insurance</em> professional.
        </h1>
        <p style={{ fontFamily: bf, fontSize: 17, color: C.platinum, maxWidth: "58ch", margin: "0 auto 40px", lineHeight: 1.65 }}>
          Master the 12-step Business Interruption methodology and the full underwriting questionnaire behind MineTrans's approach to mining risk.
        </p>
        <CtaButton onClick={() => (window.location.href = "/certification/auth")}>Get Started</CtaButton>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            marginTop: 72,
            textAlign: "left",
          }}
        >
          <StatCard value="12" label="Core Modules" desc="Comprehensive coverage of the Business Interruption methodology." />
          <StatCard value="18" label="Categories" desc="Deep dive into mining underwriting questionnaire categories." />
          <StatCard value="100%" label="Online" desc="Learn at your own pace with interactive quizzes and exams." />
        </div>
      </div>

      {/* Syllabus */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px 96px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <Eyebrow>Course Structure</Eyebrow>
          <h2 style={{ fontFamily: df, fontWeight: 600, fontSize: "clamp(1.75rem,3.4vw,2.4rem)", color: C.bone, margin: 0 }}>
            What you'll learn
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <SyllabusCard
            heading="Part I: BI Methodology"
            items={[
              "12-step Business Interruption process",
              "Risk assessment and quantification",
              "Coverage mapping and structuring",
              "Real-world case studies",
            ]}
          />
          <SyllabusCard
            heading="Part II: Underwriting"
            items={[
              "18-category questionnaire",
              "Mining-specific risks",
              "Sub-Saharan Africa focus",
              "Practical applications",
            ]}
          />
        </div>
      </div>

      {/* CTA banner */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px 96px" }}>
        <div
          style={{
            background: C.charcoal,
            border: `1px solid ${C.lineCopper}`,
            borderRadius: 6,
            padding: "56px 32px",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontFamily: df, fontWeight: 600, fontSize: "1.6rem", color: C.bone, margin: "0 0 14px" }}>
            Ready to get certified?
          </h3>
          <p style={{ fontFamily: bf, fontSize: 15, color: C.platinum, maxWidth: "52ch", margin: "0 auto 32px", lineHeight: 1.65 }}>
            Complete the course, pass the final exam, and receive your digital certificate.
          </p>
          <CtaButton onClick={() => (window.location.href = "/certification/auth")}>
            Start Certification Program
          </CtaButton>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: C.charcoal, borderTop: `1px solid ${C.line}`, padding: "80px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <Eyebrow>Questions</Eyebrow>
            <h2 style={{ fontFamily: df, fontWeight: 600, fontSize: "clamp(1.75rem,3.4vw,2.4rem)", color: C.bone, margin: 0 }}>
              Frequently asked questions
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px 40px" }}>
            <FaqItem q="How long does the course take?" a="Most students complete the certification in 4-6 weeks, studying at their own pace." />
            <FaqItem q="Can I retake the exams?" a="Yes, you can retake section quizzes and the final exam as many times as needed." />
            <FaqItem q="Is there a passing score?" a="You need to score 70% or higher on the final exam to receive your certificate." />
            <FaqItem q="What format is the certificate?" a="Certificates are issued digitally and can be downloaded as PDF with your name and score." />
          </div>
        </div>
      </div>
    </div>
  );
}
