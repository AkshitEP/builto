"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  BarChart3,
  Megaphone,
  Download,
  Presentation,
  Loader2,
  User,
  Zap,
  Calendar,
} from "lucide-react";

// Flexible interface to handle various data structures
interface BusinessViewProps {
  data: Record<string, unknown> | null;
  ideaTitle?: string;
  ideaDescription?: string;
}

// Helper to safely get string from various types
function getString(val: unknown): string {
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (val && typeof val === "object" && "name" in val) return String((val as { name: string }).name);
  if (val && typeof val === "object") return JSON.stringify(val);
  return "";
}

// Helper to safely get array of strings
function getStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.map((item) => {
    if (typeof item === "string") return item;
    if (typeof item === "object" && item && "name" in item) return String((item as { name: string }).name);
    return getString(item);
  });
}

export function BusinessView({ data, ideaTitle, ideaDescription }: BusinessViewProps) {
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [deckGenerated, setDeckGenerated] = useState(false);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-[#555]">
        <p>No business data available</p>
      </div>
    );
  }

  // Extract data with flexible access
  const marketAnalysis = data.marketAnalysis as Record<string, unknown> | undefined;
  const marketResearch = data.marketResearch as Record<string, unknown> | undefined;
  const competitorAnalysis = data.competitorAnalysis as Array<Record<string, unknown>> | undefined;
  const competitors = data.competitors as Array<Record<string, unknown>> | undefined;
  const goToMarket = data.goToMarket as Record<string, unknown> | undefined;
  const businessModel = data.businessModel as Record<string, unknown> | undefined;
  const pricingStrategy = data.pricingStrategy as Record<string, unknown> | undefined;
  const financialProjections = data.financialProjections as Record<string, unknown> | undefined;
  const financials = data.financials as Record<string, unknown> | undefined;
  const customerPersonas = data.customerPersonas as Array<Record<string, unknown>> | undefined;
  const valueProposition = data.valueProposition as Record<string, unknown> | undefined;
  const metrics = data.metrics as Record<string, unknown> | undefined;

  // Get market size info (handle different structures)
  const marketSize = marketAnalysis?.marketSize as Record<string, unknown> | undefined;
  const tam = getString(marketSize?.tam || marketResearch?.marketSize || "");
  const growthRate = getString(marketAnalysis?.growthRate || marketResearch?.growthRate || "");
  const trends = getStringArray(marketAnalysis?.trends || marketResearch?.trends || []);

  // Get competitors (handle both field names)
  const allCompetitors = competitorAnalysis || competitors || [];

  // Get channels (handle objects with name property)
  const channels = goToMarket?.channels as Array<Record<string, unknown>> | undefined;
  const channelNames = channels?.map((ch) => getString(ch.name || ch)) || [];

  // Get first 90 days
  const first90Days = goToMarket?.first90Days as Array<Record<string, unknown>> | undefined;

  // Pricing tiers
  const pricingTiers = pricingStrategy?.tiers as Array<Record<string, unknown>> | undefined;

  const generatePitchDeck = () => {
    setIsGeneratingDeck(true);

    const projectName = ideaTitle || "Startup";

    // Generate HTML pitch deck
    const deckHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - Pitch Deck</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0a0a0a; color: white; }
    .slide { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 60px 120px; position: relative; }
    .slide-number { position: absolute; bottom: 30px; right: 40px; font-size: 14px; color: #666; }
    h1 { font-size: 64px; font-weight: 700; margin-bottom: 24px; }
    h2 { font-size: 48px; font-weight: 600; margin-bottom: 20px; color: #a3e635; }
    h3 { font-size: 32px; font-weight: 600; margin-bottom: 16px; }
    p { font-size: 24px; line-height: 1.6; color: #ccc; max-width: 900px; }
    .subtitle { font-size: 28px; color: #888; }
    .gradient-text { background: linear-gradient(135deg, #a3e635, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 40px; }
    .card { background: #1a1a1a; border-radius: 16px; padding: 30px; border: 1px solid #2a2a2a; }
    .card h3 { font-size: 24px; color: #a3e635; margin-bottom: 12px; }
    .card p { font-size: 18px; }
    .stat { text-align: center; padding: 40px; }
    .stat-value { font-size: 72px; font-weight: 700; color: #a3e635; }
    .stat-label { font-size: 20px; color: #888; margin-top: 8px; }
    .list { list-style: none; margin-top: 30px; }
    .list li { font-size: 24px; color: #ccc; padding: 12px 0; border-bottom: 1px solid #2a2a2a; display: flex; align-items: center; gap: 16px; }
    .list li::before { content: "→"; color: #a3e635; font-weight: bold; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 40px; }
    .competitor { background: #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .competitor h4 { font-size: 24px; color: white; margin-bottom: 12px; }
    .tag { display: inline-block; background: #2a2a2a; color: #888; padding: 6px 14px; border-radius: 20px; font-size: 14px; margin: 4px; }
    .tag.green { background: #22543d; color: #68d391; }
    .tag.red { background: #742a2a; color: #fc8181; }
    .cta { background: linear-gradient(135deg, #a3e635, #22d3ee); color: black; padding: 20px 50px; border-radius: 12px; font-size: 24px; font-weight: 600; display: inline-block; margin-top: 30px; }
    @media print { .slide { page-break-after: always; } }
  </style>
</head>
<body>
  <div class="slide" style="background: linear-gradient(135deg, #0a0a0a, #1a1a1a);">
    <h1 class="gradient-text">${projectName}</h1>
    <p class="subtitle">${ideaDescription || "Revolutionizing the industry"}</p>
    <div class="cta">Investor Pitch Deck</div>
    <div class="slide-number">1</div>
  </div>

  <div class="slide">
    <h2>Market Opportunity</h2>
    <div class="cards">
      <div class="card stat">
        <div class="stat-value">${tam || "$50B"}</div>
        <div class="stat-label">Total Addressable Market</div>
      </div>
      <div class="card stat">
        <div class="stat-value">${growthRate || "25%"}</div>
        <div class="stat-label">Annual Growth Rate</div>
      </div>
      <div class="card stat">
        <div class="stat-value">${allCompetitors.length || 3}</div>
        <div class="stat-label">Key Competitors</div>
      </div>
    </div>
    ${trends.length > 0 ? `
    <h3 style="margin-top: 50px;">Key Trends</h3>
    <ul class="list">
      ${trends.slice(0, 3).map(t => `<li>${t}</li>`).join('')}
    </ul>
    ` : ''}
    <div class="slide-number">2</div>
  </div>

  <div class="slide">
    <h2>Competitive Landscape</h2>
    <div style="margin-top: 40px;">
      ${allCompetitors.slice(0, 3).map(c => `
      <div class="competitor">
        <h4>${getString(c.name)}</h4>
        <div>
          ${getStringArray(c.strengths).slice(0, 2).map(s => `<span class="tag green">${s}</span>`).join('')}
          ${getStringArray(c.weaknesses).slice(0, 2).map(w => `<span class="tag red">${w}</span>`).join('')}
        </div>
      </div>
      `).join('')}
    </div>
    <div class="slide-number">3</div>
  </div>

  <div class="slide">
    <h2>Go-to-Market Strategy</h2>
    <p>${getString(goToMarket?.strategy || "Multi-channel approach")}</p>
    <h3 style="margin-top: 50px;">Channels</h3>
    <div class="cards">
      ${channelNames.slice(0, 3).map(ch => `
      <div class="card"><h3>${ch}</h3></div>
      `).join('')}
    </div>
    <div class="slide-number">4</div>
  </div>

  <div class="slide">
    <h2>Financial Projections</h2>
    <div class="cards" style="grid-template-columns: repeat(3, 1fr);">
      <div class="card stat">
        <div class="stat-value" style="font-size: 48px;">${getString(financialProjections?.initialInvestment || financials?.initialInvestment || "$500K")}</div>
        <div class="stat-label">Seed Round</div>
      </div>
      <div class="card stat">
        <div class="stat-value" style="font-size: 48px;">${getString(financialProjections?.breakEvenPoint || financials?.breakEvenPoint || "18 mo")}</div>
        <div class="stat-label">Break Even</div>
      </div>
      <div class="card stat">
        <div class="stat-value" style="font-size: 48px;">${getString(financialProjections?.year1Revenue || financials?.yearOneRevenue || "$1M")}</div>
        <div class="stat-label">Year 1 Revenue</div>
      </div>
    </div>
    <div class="slide-number">5</div>
  </div>

  <div class="slide" style="text-align: center; background: linear-gradient(135deg, #0a0a0a, #1a1a1a);">
    <h1 class="gradient-text">Thank You</h1>
    <p class="subtitle" style="text-align: center; margin-top: 20px;">Let's build the future together</p>
    <div class="cta" style="margin-top: 50px;">Contact Us</div>
    <div class="slide-number">6</div>
  </div>
</body>
</html>`;

    // Create and download the file
    const blob = new Blob([deckHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}-pitch-deck.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsGeneratingDeck(false);
      setDeckGenerated(true);
    }, 1000);
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Pitch Deck button */}
        <div className="bg-gradient-to-r from-[#1a1a1a] to-[#1f1a1a] rounded-xl p-6 border border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Business Strategy</h2>
              <p className="text-sm text-[#888]">
                {data.executiveSummary ? getString(data.executiveSummary) : "Market research, competition analysis, and go-to-market plan"}
              </p>
            </div>
            <button
              onClick={generatePitchDeck}
              disabled={isGeneratingDeck}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-black font-medium rounded-lg transition-all"
            >
              {isGeneratingDeck ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Presentation className="w-4 h-4" />
                  Download Pitch Deck
                </>
              )}
            </button>
          </div>
          {deckGenerated && (
            <p className="text-xs text-emerald-400 mt-2">
              ✓ Pitch deck downloaded! Open the HTML file and press Ctrl+P to save as PDF.
            </p>
          )}
        </div>

        {/* Market Analysis */}
        {(marketAnalysis || marketResearch) && (
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Market Analysis
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0f0f0f] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{tam || "N/A"}</div>
                <div className="text-xs text-[#888] mt-1">TAM</div>
              </div>
              <div className="bg-[#0f0f0f] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{growthRate || "N/A"}</div>
                <div className="text-xs text-[#888] mt-1">Growth Rate</div>
              </div>
              <div className="bg-[#0f0f0f] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{allCompetitors.length}</div>
                <div className="text-xs text-[#888] mt-1">Competitors</div>
              </div>
            </div>
            {trends.length > 0 && (
              <div>
                <span className="text-xs text-[#888]">Key Trends</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {trends.map((trend, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-400/10 text-blue-400 rounded-full text-xs">
                      {trend}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Value Proposition */}
        {valueProposition && (
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Value Proposition
            </h3>
            <p className="text-[#ccc] mb-4">{getString(valueProposition.statement)}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-[#888]">Key Benefits</span>
                <ul className="mt-2 space-y-1">
                  {getStringArray(valueProposition.keyBenefits).map((b, i) => (
                    <li key={i} className="text-xs text-[#ccc] flex items-start gap-2">
                      <span className="text-emerald-400">✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-xs text-[#888]">Differentiators</span>
                <ul className="mt-2 space-y-1">
                  {getStringArray(valueProposition.differentiators).map((d, i) => (
                    <li key={i} className="text-xs text-[#ccc] flex items-start gap-2">
                      <span className="text-lime-400">★</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Customer Personas */}
        {customerPersonas && customerPersonas.length > 0 && (
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Customer Personas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {customerPersonas.slice(0, 4).map((persona, i) => (
                <div key={i} className="bg-[#0f0f0f] rounded-lg p-4 border border-[#2a2a2a]">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-medium">{getString(persona.name)}</span>
                  </div>
                  <p className="text-xs text-[#888] mb-2">{getString(persona.demographics)}</p>
                  <div className="space-y-1">
                    {getStringArray(persona.painPoints).slice(0, 2).map((p, j) => (
                      <p key={j} className="text-xs text-red-400">• {p}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitors */}
        {allCompetitors.length > 0 && (
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-red-400" />
              Competitive Analysis
            </h3>
            <div className="space-y-4">
              {allCompetitors.map((comp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#0f0f0f] rounded-lg p-4 border border-[#2a2a2a]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{getString(comp.name)}</h4>
                    {getString(comp.marketShare) && (
                      <span className="text-xs text-[#888]">{getString(comp.marketShare)} market share</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-emerald-400">Strengths</span>
                      <ul className="mt-1 space-y-1">
                        {getStringArray(comp.strengths).map((s, j) => (
                          <li key={j} className="text-xs text-[#ccc]">• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-xs text-red-400">Weaknesses</span>
                      <ul className="mt-1 space-y-1">
                        {getStringArray(comp.weaknesses).map((w, j) => (
                          <li key={j} className="text-xs text-[#ccc]">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Strategy */}
        {pricingStrategy && pricingTiers && pricingTiers.length > 0 && (
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              Pricing Strategy ({getString(pricingStrategy.model)})
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {pricingTiers.map((tier, i) => (
                <div key={i} className="bg-[#0f0f0f] rounded-lg p-4 border border-[#2a2a2a]">
                  <h4 className="font-medium text-white">{getString(tier.name)}</h4>
                  <p className="text-xl font-bold text-green-400 mt-1">{getString(tier.price)}</p>
                  <p className="text-xs text-[#888] mt-2">{getString(tier.target)}</p>
                  <ul className="mt-2 space-y-1">
                    {getStringArray(tier.features).slice(0, 3).map((f, j) => (
                      <li key={j} className="text-xs text-[#ccc]">✓ {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Go-to-Market */}
        {goToMarket && (
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-orange-400" />
              Go-to-Market Strategy
            </h3>
            <p className="text-[#ccc] mb-4">{getString(goToMarket.strategy)}</p>

            {channels && channels.length > 0 && (
              <div className="mb-4">
                <span className="text-xs text-[#888]">Channels</span>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {channels.slice(0, 4).map((ch, i) => (
                    <div key={i} className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
                      <h4 className="text-sm font-medium text-orange-400">{getString(ch.name)}</h4>
                      <p className="text-xs text-[#888] mt-1">{getString(ch.strategy)}</p>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-[#666]">Budget: {getString(ch.budget)}</span>
                        <span className="text-[#666]">CAC: {getString(ch.expectedCAC)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {first90Days && first90Days.length > 0 && (
              <div>
                <span className="text-xs text-[#888]">First 90 Days</span>
                <div className="mt-2 space-y-2">
                  {first90Days.map((action, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#0f0f0f] rounded p-2 border border-[#2a2a2a]">
                      <span className="text-xs text-lime-400 font-medium w-20">{getString(action.week)}</span>
                      <span className="text-xs text-white flex-1">{getString(action.action)}</span>
                      <span className="text-xs text-[#888]">{getString(action.goal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metrics */}
        {metrics && (
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Key Metrics
            </h3>
            <div className="mb-4">
              <span className="text-xs text-[#888]">North Star Metric</span>
              <p className="text-lime-400 font-medium">{getString(metrics.north_star)}</p>
            </div>
            {(metrics.kpis as Array<Record<string, unknown>>)?.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {(metrics.kpis as Array<Record<string, unknown>>).map((kpi, i) => (
                  <div key={i} className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
                    <span className="text-xs text-[#888]">{getString(kpi.name)}</span>
                    <p className="text-white font-medium">{getString(kpi.target)}</p>
                    <span className="text-xs text-cyan-400">{getString(kpi.frequency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Financial Projections */}
        {(financialProjections || financials) && (
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Financial Projections
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#0f0f0f] rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-purple-400">
                  {getString(financialProjections?.initialInvestment || financials?.initialInvestment)}
                </div>
                <div className="text-xs text-[#888] mt-1">Initial Investment</div>
              </div>
              <div className="bg-[#0f0f0f] rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-blue-400">
                  {getString(financialProjections?.breakEvenPoint || financials?.breakEvenPoint)}
                </div>
                <div className="text-xs text-[#888] mt-1">Break Even</div>
              </div>
              <div className="bg-[#0f0f0f] rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-green-400">
                  {getString(financialProjections?.year1Revenue || financials?.yearOneRevenue)}
                </div>
                <div className="text-xs text-[#888] mt-1">Year 1 Revenue</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
