/*
 * Static reference library for the Blueprint BI Assessment Generator.
 * Illustrative training content only — figures are hypothetical, invented
 * to demonstrate MineTrans's 11-point BI assessment framework. Never real
 * client data. Used as the guaranteed-available fallback when the live
 * AI-generation endpoint (/api/bi-assessment/generate) is not reachable.
 */
window.MT_BI_EXAMPLES = {

"Gold": `Illustrative training example — all figures below are hypothetical and invented to demonstrate the methodology for an underground gold operation. Not real client data.

## Description of the mining process and critical operations
Conventional narrow-reef underground mining using a drill-blast-clean cycle. Ore is hoisted via a single main shaft, then crushed, milled, and processed through a CIL (carbon-in-leach) plant to produce doré bars. The critical path runs shaft hoisting → crushing → milling → leaching → elution/smelting, with the shaft and headgear forming the single greatest chokepoint: all ore and personnel movement depends on it.

## Asset criticality ranking and production bottlenecks
1. Main shaft headgear and winder (replacement lead time 18–24 months)
2. SAG/ball mill (lead time 12–14 months)
3. CIL tanks and elution circuit
4. Underground pumping and ventilation infrastructure
5. Surface substation and transformers

The winder's hoisting capacity caps total throughput regardless of underground production rate — a winder failure halts the entire operation, not just one section.

## Maximum Foreseeable Loss (MFL) scenario
A catastrophic headgear collapse or winder fire that takes the shaft fully out of service. The MFL assumes total production stoppage for the full replacement and rebuild period, with no alternative hoisting route available on this single-shaft operation.

## Gross Profit calculation based on policy wording
Gross Profit = Turnover minus Uninsured Working Expenses, per standard BI wording — i.e., turnover less variable costs that cease with production (reagents, tonnage-linked contractor labour), while standing charges (permanent staff, maintenance contracts, insurance, rehabilitation obligations) continue during the interruption.

**Illustrative:** Turnover USD 480m − Uninsured Working Expenses USD 175m = **Gross Profit at risk USD 305m/year**.

## Production interruption and recovery model
- **Phase 1 (months 0–3):** Total stoppage, no hoisting capacity.
- **Phase 2 (months 3–9):** Partial recovery via a temporary winder arrangement at approximately 35% capacity.
- **Phase 3 (months 9–20):** Full headgear rebuild and commissioning, ramping from 35% to 100%.

Full production is only restored at approximately month 20.

## Increased Cost of Working assessment
Costs incurred to reduce the loss include emergency/temporary winder hire, expedited procurement and airfreight of long-lead components, contractor premiums for an accelerated rebuild, and temporary ore trucking to a toll-treatment plant. ICOW is only insured up to the value of gross profit it actually saves, and must be tested against that economic limit.

## Supply chain and utility dependency analysis
Key dependencies include grid power (single feed, no full-capacity backup generation on site), reagent supply (cyanide, lime — often single-sourced), OEM winder/headgear fabrication (long lead time, frequently ex-country), and process water for the plant. A regional grid failure or reagent supply disruption is a correlated risk that can compound a physical-damage BI loss.

## Recommended indemnity period, with justification
**24 months.** Justified by the 18–24 month headgear replacement lead time plus the ramp-up period to full production — the indemnity period must cover the entire recovery curve, not just the physical rebuild time.

## Recommended Business Interruption sum insured
Sum Insured = Gross Profit at risk × indemnity period, adjusted for anticipated growth.

**Illustrative:** USD 305m/year × 2 years, trended at approximately 5%/year = **≈ USD 640m**.

## Scenario-based BI loss estimates
- Minor event (mill breakdown, 6 weeks): ≈ USD 35m
- Moderate event (partial shaft damage, 6 months): ≈ USD 150m
- MFL event (headgear/winder total loss, 20-month recovery): ≈ USD 480–520m

## Key assumptions, exclusions, and sensitivity analysis
Assumes single-shaft dependency with no viable alternative access. Excludes contingent BI arising from a key customer's or smelter's own interruption unless separately extended, and excludes gradual or wear-related deterioration. Most sensitive to the gold price assumption used for revenue trending and to actual OEM lead times, which vary materially by manufacturer backlog.`,

"Diamonds": `Illustrative training example — all figures below are hypothetical and invented to demonstrate the methodology for an open-pit kimberlite diamond operation. Not real client data.

## Description of the mining process and critical operations
Open-pit kimberlite mining: drill-blast-load-haul delivers run-of-mine ore to a crushing circuit, then dense media separation (DMS) concentrates the ore, followed by X-ray/laser sorting and final recovery in a secured recovery house. The critical path is crushing → DMS → sorting → secure recovery, with the DMS plant and recovery/sort house forming the single point through which all value passes.

## Asset criticality ranking and production bottlenecks
1. DMS plant (dense media separation — replacement lead time 9–14 months)
2. Final recovery and sort house (security-sensitive, difficult to duplicate quickly)
3. Primary and secondary crushers
4. X-ray/laser sorting units
5. Pit dewatering pumps

Bottleneck: the DMS plant is the sole route to value realization — pit output has no economic value until it passes through it.

## Maximum Foreseeable Loss (MFL) scenario
A fire or explosion in the recovery/sort house, or catastrophic DMS plant failure, halting all value recovery even though pit mining could physically continue. The MFL assumes a full stoppage of saleable production for the plant and recovery-house rebuild period.

## Gross Profit calculation based on policy wording
Gross Profit = Turnover minus Uninsured Working Expenses. Diamond operations typically carry higher margins than bulk commodities, but revenue is highly sensitive to average selling price per carat and quality mix — this sensitivity must be reflected in the Gross Profit build-up, not just tonnage.

**Illustrative:** Turnover USD 260m − Uninsured Working Expenses USD 95m = **Gross Profit at risk USD 165m/year**.

## Production interruption and recovery model
- **Phase 1 (months 0–2):** Total stoppage — no processing or recovery capability.
- **Phase 2 (months 2–7):** Emergency toll-treatment at a nearby DMS facility, recovering at roughly 40% of normal throughput.
- **Phase 3 (months 7–13):** On-site plant and recovery-house rebuild, re-certification of security systems, ramping to full production.

## Increased Cost of Working assessment
Costs incurred to reduce the loss include toll-treatment fees at a third-party DMS facility, transport and security escort costs for moving concentrate off-site, and enhanced/temporary security arrangements during the rebuild. ICOW is tested against the gross profit it saves, capped at that economic value.

## Supply chain and utility dependency analysis
Key dependencies include security and logistics arrangements for stone transport (a diamond-specific risk not present in bulk commodities), grid power for X-ray sorting equipment, and process water for the DMS circuit. Loss of secure transport capability can itself interrupt value realization even where the plant is undamaged.

## Recommended indemnity period, with justification
**15 months.** Justified by the plant/recovery-house rebuild timeline plus the time required to re-certify security systems before full recovery operations can resume — a step specific to diamond operations that has no equivalent in bulk-commodity recovery.

## Recommended Business Interruption sum insured
Sum Insured = Gross Profit at risk × indemnity period, adjusted for anticipated trend.

**Illustrative:** USD 165m/year × 1.25 years, trended at approximately 4%/year = **≈ USD 215m**.

## Scenario-based BI loss estimates
- Minor event (DMS component failure, 4 weeks): ≈ USD 13m
- Moderate event (partial plant damage, 4 months): ≈ USD 55m
- MFL event (recovery house/DMS total loss, 13-month recovery): ≈ USD 175–200m

## Key assumptions, exclusions, and sensitivity analysis
Assumes toll-treatment capacity is available within a reasonable haul distance during the interruption. Excludes loss arising from theft or diamond-specific security breaches (typically covered separately, not as BI), and excludes revenue volatility from tender/auction timing unrelated to the insured event. Most sensitive to the average selling price and quality-mix assumptions used to build the Gross Profit figure.`,

"Coal": `Illustrative training example — all figures below are hypothetical and invented to demonstrate the methodology for an opencast, truck-and-shovel coal operation. Not real client data.

## Description of the mining process and critical operations
Opencast mining using a drill-blast-strip sequence, with draglines and truck-and-shovel fleets removing overburden and loading run-of-mine coal. Coal is processed through a wash plant/beneficiation circuit and moved to market by rail or road. The critical path is extraction → load-haul → wash plant → rail/port allocation, with logistics allocation frequently the true constraint on realized output, not extraction capacity itself.

## Asset criticality ranking and production bottlenecks
1. Dragline(s) or primary excavation fleet (long lead time for major component replacement)
2. Wash/beneficiation plant
3. Haul truck fleet
4. Rail loop and load-out facility
5. Pit dewatering infrastructure

Bottleneck: a dragline or primary excavator failure caps overburden removal and therefore coal exposure, but rail/port allocation constraints can independently cap realized sales even when mining output is unaffected.

## Maximum Foreseeable Loss (MFL) scenario
Major dragline failure (e.g. boom collapse) combined with pit flooding that prevents access to the working face. The MFL assumes a substantial reduction in extraction capability for the full repair and dewatering period, with wash plant output falling proportionately.

## Gross Profit calculation based on policy wording
Gross Profit = Turnover minus Uninsured Working Expenses. Coal operations typically carry lower margins than precious-metal or diamond operations, with a high proportion of standing charges tied to logistics contracts (rail/port take-or-pay commitments) that continue regardless of production status.

**Illustrative:** Turnover USD 340m − Uninsured Working Expenses USD 210m = **Gross Profit at risk USD 130m/year**.

## Production interruption and recovery model
- **Phase 1 (months 0–2):** Significant capacity loss — extraction limited to secondary equipment only.
- **Phase 2 (months 2–8):** Pit dewatering complete, contract-hire excavation fleet supplementing capacity to roughly 60%.
- **Phase 3 (months 8–14):** Dragline repair/rebuild complete, ramping to full extraction and wash plant throughput.

## Increased Cost of Working assessment
Costs incurred to reduce the loss include contract hire of replacement excavators and trucks, alternative haul route development, and expedited dewatering pump mobilization. ICOW must be tested against the gross profit and, critically, against any take-or-pay logistics penalties it avoids — these can be material in coal.

## Supply chain and utility dependency analysis
Key dependencies include rail allocation and port capacity (often the real constraint on sales realization, external to the insured's own operations), grid power for the wash plant, and explosives supply for the blast cycle. A logistics-side constraint can mean physical repair completion does not translate directly into full revenue recovery.

## Recommended indemnity period, with justification
**18 months.** Justified by the combined dragline repair and pit dewatering timeline, with an allowance for the ramp-up period needed to rebuild rail/port allocation to pre-loss levels, which often lags physical production recovery.

## Recommended Business Interruption sum insured
Sum Insured = Gross Profit at risk × indemnity period, adjusted for anticipated trend.

**Illustrative:** USD 130m/year × 1.5 years, trended at approximately 3%/year = **≈ USD 200m**.

## Scenario-based BI loss estimates
- Minor event (truck fleet disruption, 6 weeks): ≈ USD 15m
- Moderate event (wash plant breakdown, 5 months): ≈ USD 55m
- MFL event (dragline failure plus pit flooding, 14-month recovery): ≈ USD 165–185m

## Key assumptions, exclusions, and sensitivity analysis
Assumes contract-hire replacement equipment is available within the region during the interruption. Excludes loss arising purely from market-side coal price movements unrelated to the insured event, and excludes rail/port capacity loss caused by a third party's own infrastructure failure unless separately extended. Most sensitive to take-or-pay logistics commitments and to actual dragline component lead times.`,

"Chrome": `Illustrative training example — all figures below are hypothetical and invented to demonstrate the methodology for an open-pit UG2/LG6 chrome operation with an integrated ferrochrome smelter. Not real client data.

## Description of the mining process and critical operations
Open-pit mining of chromite-bearing reef (UG2/LG6), with drill-blast extraction feeding a crushing and milling circuit, then gravity and spiral concentration to produce chrome concentrate. Where smelting is integrated, concentrate is fed to an electric-arc furnace with coke as reductant, producing ferrochrome. The critical path is concentration → smelting, with the smelter forming a major additional chokepoint beyond the mine itself when integrated.

## Asset criticality ranking and production bottlenecks
1. Ferrochrome smelter furnace and refractory lining (replacement/reline lead time 6–12 months)
2. Concentrator plant (gravity/spiral circuit)
3. Primary crusher and mill
4. Power supply infrastructure (smelting is highly power-intensive)
5. Open-pit fleet (drill rigs, excavators, haul trucks)

Bottleneck: the smelter furnace dominates the critical path — a reline or furnace failure can idle downstream value-add even where mining and concentration are undamaged.

## Maximum Foreseeable Loss (MFL) scenario
A furnace failure requiring a full refractory reline, effectively halting ferrochrome production while concentrate output continues to accumulate unsold or must be sold at a lower-value ore/concentrate price. The MFL assumes total smelting stoppage for the full reline period.

## Gross Profit calculation based on policy wording
Gross Profit = Turnover minus Uninsured Working Expenses. Where smelting is integrated, Gross Profit must be built on realized ferrochrome revenue, not concentrate/ore revenue — the value-add differential between the two is the material driver of the exposure.

**Illustrative:** Turnover USD 310m (ferrochrome) − Uninsured Working Expenses USD 205m = **Gross Profit at risk USD 105m/year**.

## Production interruption and recovery model
- **Phase 1 (months 0–2):** Smelting halted; concentrate stockpiled or sold at ore/concentrate pricing, well below ferrochrome value.
- **Phase 2 (months 2–8):** Toll-smelting arrangement with a third-party furnace recovers a portion of ferrochrome-equivalent revenue, at reduced margin.
- **Phase 3 (months 8–18):** Furnace reline and recommissioning complete, ramping to full smelting throughput.

## Increased Cost of Working assessment
Costs incurred to reduce the loss include toll-smelting fees paid to a third-party furnace operator, additional transport of concentrate to and ferrochrome from the toll facility, and expedited refractory material procurement. ICOW is tested against the value-add differential it recovers, capped at the gross profit it saves.

## Supply chain and utility dependency analysis
Key dependencies include reductant (metallurgical coke) supply, and grid power/tariff availability — smelting is highly power-intensive and grid-dependent, making power supply interruption a correlated risk with equal or greater impact than mechanical failure. Reductant price volatility also affects the Gross Profit baseline independent of any insured event.

## Recommended indemnity period, with justification
**20 months.** Justified by the furnace reline and recommissioning timeline, extended beyond the physical reline period to capture the ramp-up needed to restore full smelting throughput and rebuild any toll-smelting-related margin gap.

## Recommended Business Interruption sum insured
Sum Insured = Gross Profit at risk × indemnity period, adjusted for anticipated trend.

**Illustrative:** USD 105m/year × 1.67 years, trended at approximately 4%/year = **≈ USD 185m**.

## Scenario-based BI loss estimates
- Minor event (concentrator plant breakdown, 5 weeks): ≈ USD 10m
- Moderate event (partial furnace damage, 5 months): ≈ USD 45m
- MFL event (furnace total loss/full reline, 18-month recovery): ≈ USD 155–175m

## Key assumptions, exclusions, and sensitivity analysis
Assumes toll-smelting capacity is available within the region during the interruption. Excludes loss arising from grid load-shedding or power curtailment unless specifically extended as a named peril, and excludes ferrochrome price volatility unrelated to the insured event. Most sensitive to the ferrochrome-versus-concentrate value-add differential and to power tariff/availability assumptions.`,

"Platinum Group Metals": `Illustrative training example — all figures below are hypothetical and invented to demonstrate the methodology for an underground PGM (platinum, palladium, rhodium) operation with an on-site concentrator and smelter. Not real client data.

## Description of the mining process and critical operations
Underground narrow-reef mining (Merensky/UG2 reef types) using conventional or mechanised mining methods, with ore hoisted to surface and processed through a concentrator (crushing, milling, flotation) to produce PGM concentrate, then smelted and refined to matte or refined metal. The critical path is shaft hoisting → concentrator → smelter → refinery, with multiple long-lead chokepoints across the value chain.

## Asset criticality ranking and production bottlenecks
1. Concentrator flotation circuit and smelter furnace (long lead times, 12–18 months)
2. Shaft hoisting infrastructure
3. Underground mechanised mining fleet
4. Ventilation and cooling systems (critical at depth)
5. Tailings storage facility and associated infrastructure

Bottleneck: PGM operations typically carry the longest and most complex value chain of the commodities covered here — a failure at any single stage (mining, concentrating, or smelting) can constrain the whole operation, so criticality ranking must be reassessed per operation rather than assumed.

## Maximum Foreseeable Loss (MFL) scenario
A concentrator flotation circuit fire combined with smelter furnace damage from the resulting disruption, halting all metal production even though underground mining could continue extracting ore that cannot be processed. The MFL assumes total processing stoppage for the full rebuild period, with mined ore stockpiled at limited storage capacity.

## Gross Profit calculation based on policy wording
Gross Profit = Turnover minus Uninsured Working Expenses. PGM revenue is a basket calculation across platinum, palladium, and rhodium, each with independently volatile pricing — the Gross Profit build-up must weight the basket correctly, as rhodium in particular can represent a disproportionate share of revenue relative to volume.

**Illustrative:** Turnover USD 620m − Uninsured Working Expenses USD 260m = **Gross Profit at risk USD 360m/year**.

## Production interruption and recovery model
- **Phase 1 (months 0–3):** Total processing stoppage; mining continues to a limited stockpile capacity before also curtailing.
- **Phase 2 (months 3–11):** Toll-concentrating and toll-smelting arrangements with third-party facilities recover a portion of throughput, at reduced margin due to toll fees and logistics.
- **Phase 3 (months 11–22):** Concentrator and smelter rebuild complete, ramping to full throughput.

## Increased Cost of Working assessment
Costs incurred to reduce the loss include toll-concentrating and toll-smelting fees, additional transport of ore/concentrate between facilities, and expedited procurement of flotation cells and furnace components. Given the long value chain, ICOW analysis must separately test each stage's toll-processing option against the gross profit it preserves.

## Supply chain and utility dependency analysis
Key dependencies include grid power (concentrating and smelting are both power-intensive), water supply for flotation, tailings storage capacity (limits how long mining can continue during a processing stoppage), and specialist OEM supply for flotation and furnace equipment, often ex-country with long lead times.

## Recommended indemnity period, with justification
**24 months.** Justified by the combined concentrator and smelter rebuild timeline being the longest in this commodity set, given the multi-stage value chain and the ramp-up period required to restore full-basket metal production.

## Recommended Business Interruption sum insured
Sum Insured = Gross Profit at risk × indemnity period, adjusted for anticipated trend.

**Illustrative:** USD 360m/year × 2 years, trended at approximately 5%/year = **≈ USD 755m**.

## Scenario-based BI loss estimates
- Minor event (flotation cell failure, 6 weeks): ≈ USD 40m
- Moderate event (partial smelter damage, 7 months): ≈ USD 190m
- MFL event (concentrator/smelter total loss, 22-month recovery): ≈ USD 640–680m

## Key assumptions, exclusions, and sensitivity analysis
Assumes toll-concentrating and toll-smelting capacity is available regionally during the interruption, and that tailings storage capacity allows mining to continue at a reduced rate rather than stopping immediately. Excludes basket-price volatility unrelated to the insured event, and excludes gradual deterioration of flotation/furnace components. Most sensitive to the platinum/palladium/rhodium price-mix assumption and to OEM lead times for specialist processing equipment.`,

"Iron Ore": `Illustrative training example — all figures below are hypothetical and invented to demonstrate the methodology for an open-pit iron ore operation with rail-linked export logistics. Not real client data.

## Description of the mining process and critical operations
Open-pit mining using drill-blast-load-haul, with run-of-mine ore processed through crushing and screening (and beneficiation where grade requires it) to produce export-grade lump and fines product, moved by dedicated rail to a port terminal for export. The critical path is extraction → crush/screen → rail → port, with rail and port capacity frequently the binding constraint on realized sales rather than mine output.

## Asset criticality ranking and production bottlenecks
1. Rail line and rolling stock allocation (often externally controlled, long lead time to expand)
2. Crushing and screening plant
3. Primary excavation and haul fleet
4. Port terminal stockpile and ship-loading capacity
5. Pit dewatering infrastructure

Bottleneck: unlike most of the commodities in this set, the single greatest constraint on realized revenue is typically logistics allocation (rail/port), not the mine's own extraction or processing capacity — this must be reflected explicitly in the criticality ranking.

## Maximum Foreseeable Loss (MFL) scenario
A crusher/screening plant fire combined with rail line damage from the same event (e.g. a derailment at the loading point), halting both processing and evacuation of product. The MFL assumes total stoppage of saleable production for the combined plant and rail-infrastructure repair period.

## Gross Profit calculation based on policy wording
Gross Profit = Turnover minus Uninsured Working Expenses. Iron ore operations typically carry substantial standing charges tied to rail take-or-pay and port allocation contracts that continue regardless of production status, materially narrowing the variable-cost deduction relative to other commodities in this set.

**Illustrative:** Turnover USD 550m − Uninsured Working Expenses USD 340m = **Gross Profit at risk USD 210m/year**.

## Production interruption and recovery model
- **Phase 1 (months 0–2):** Total stoppage — no crushing/screening output and rail line unusable at the loading point.
- **Phase 2 (months 2–6):** Temporary rail siding repair restores partial evacuation capacity (~50%), with crushing plant operating on contract-hire mobile crushing units.
- **Phase 3 (months 6–11):** Permanent plant and rail infrastructure rebuild complete, ramping to full throughput and rail allocation.

## Increased Cost of Working assessment
Costs incurred to reduce the loss include contract-hire mobile crushing/screening units, temporary rail siding repair, and road-haul of product to an alternative loading point where feasible. ICOW must be tested against gross profit saved and against any rail/port take-or-pay penalties avoided, which can be substantial in iron ore.

## Supply chain and utility dependency analysis
Key dependencies include rail network availability and condition (frequently third-party or state-operated infrastructure outside the insured's control), port terminal capacity and ship-loading equipment, and grid power for the crushing/screening plant. Rail or port capacity loss caused by a third party's own infrastructure failure is a key exposure to flag for possible contingent BI or separate extension.

## Recommended indemnity period, with justification
**12 months.** Justified by the plant and rail-infrastructure repair timeline being comparatively shorter than the deep-level or smelting-dependent commodities in this set, but with explicit allowance for the ramp-up period needed to restore rail/port allocation to pre-loss levels.

## Recommended Business Interruption sum insured
Sum Insured = Gross Profit at risk × indemnity period, adjusted for anticipated trend.

**Illustrative:** USD 210m/year × 1 year, trended at approximately 3%/year = **≈ USD 215m**.

## Scenario-based BI loss estimates
- Minor event (crusher breakdown, 3 weeks): ≈ USD 12m
- Moderate event (rail siding damage, 3 months): ≈ USD 50m
- MFL event (combined plant/rail infrastructure loss, 11-month recovery): ≈ USD 180–200m

## Key assumptions, exclusions, and sensitivity analysis
Assumes contract-hire mobile crushing capacity and an alternative loading point are available within the region during the interruption. Excludes loss arising purely from iron ore price movements unrelated to the insured event, and excludes rail/port infrastructure failure caused by a third party's own asset unless separately extended as contingent BI. Most sensitive to rail/port take-or-pay commitments and to the actual repair timeline for rail infrastructure, which is often outside the insured's direct control.`

};
