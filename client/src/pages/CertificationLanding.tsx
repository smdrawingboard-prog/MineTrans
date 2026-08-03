import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CertificationLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-amber-600/30 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-600">MineTrans</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => (window.location.href = "/certification/admin/login")}
              variant="ghost"
              className="text-slate-400 hover:text-amber-600 text-sm"
            >
              Admin
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="ghost"
              className="text-slate-300 hover:text-white"
            >
              Back to Website
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            <span className="text-amber-600">MineTrans</span> Certification Program
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Master the art of mining insurance underwriting with our comprehensive certification course. Learn the 12-step Business Interruption methodology and become a certified mining insurance professional.
          </p>
          <Button
            onClick={() => (window.location.href = "/certification/auth")}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-slate-800 border-amber-600/30 p-6">
            <div className="text-3xl font-bold text-amber-600 mb-3">12</div>
            <h3 className="text-lg font-bold mb-2">Core Modules</h3>
            <p className="text-slate-400">
              Comprehensive coverage of the Business Interruption methodology
            </p>
          </Card>

          <Card className="bg-slate-800 border-amber-600/30 p-6">
            <div className="text-3xl font-bold text-amber-600 mb-3">18</div>
            <h3 className="text-lg font-bold mb-2">Categories</h3>
            <p className="text-slate-400">
              Deep dive into mining underwriting questionnaire categories
            </p>
          </Card>

          <Card className="bg-slate-800 border-amber-600/30 p-6">
            <div className="text-3xl font-bold text-amber-600 mb-3">100%</div>
            <h3 className="text-lg font-bold mb-2">Online</h3>
            <p className="text-slate-400">
              Learn at your own pace with interactive quizzes and exams
            </p>
          </Card>
        </div>

        {/* Course Overview */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8 text-center">What You'll Learn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h4 className="text-xl font-bold text-amber-600 mb-4">Part I: BI Methodology</h4>
              <ul className="space-y-2 text-slate-300">
                <li>✓ 12-step Business Interruption process</li>
                <li>✓ Risk assessment and quantification</li>
                <li>✓ Coverage mapping and structuring</li>
                <li>✓ Real-world case studies</li>
              </ul>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h4 className="text-xl font-bold text-amber-600 mb-4">Part II: Underwriting</h4>
              <ul className="space-y-2 text-slate-300">
                <li>✓ 18-category questionnaire</li>
                <li>✓ Mining-specific risks</li>
                <li>✓ Sub-Saharan Africa focus</li>
                <li>✓ Practical applications</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-600/20 to-amber-600/10 border border-amber-600/30 rounded-lg p-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Certified?</h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Join our community of certified mining insurance professionals. Complete the course, pass the final exam, and receive your digital certificate.
          </p>
          <Button
            onClick={() => (window.location.href = "/certification/auth")}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
          >
            Start Certification Program
          </Button>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-slate-800/50 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-amber-600 mb-2">How long does the course take?</h4>
              <p className="text-slate-400">
                Most students complete the certification in 4-6 weeks, studying at their own pace.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-amber-600 mb-2">Can I retake the exams?</h4>
              <p className="text-slate-400">
                Yes, you can retake section quizzes and the final exam as many times as needed.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-amber-600 mb-2">Is there a passing score?</h4>
              <p className="text-slate-400">
                You need to score 70% or higher on the final exam to receive your certificate.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-amber-600 mb-2">What format is the certificate?</h4>
              <p className="text-slate-400">
                Certificates are issued digitally and can be downloaded as PDF with your name and score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
