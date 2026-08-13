export const courseData = {
  title: 'MineTrans Advanced Mining Insurance Blueprint',
  partI: [
    {
      id: 'step-1',
      n: 1,
      title: 'Understand the Mining Operation',
      section: 'Part I: 12-Step BI Methodology',
      icon: 'chain' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Document the complete mining value chain before anything else. This is the foundation every downstream calculation depends on.',
        },
        {
          t: 'image' as const,
          src: '/images/mining/mine-overview.jpg',
          alt: 'Open-pit mining operation with haul trucks and excavators',
          caption: 'The value chain starts here — pit to port',
        },
        {
          t: 'list' as const,
          v: [
            'Exploration (if applicable)',
            'Drilling and blasting',
            'Loading and hauling',
            'Crushing and screening',
            'Processing / beneficiation',
            'Tailings management',
            'Stockpiling',
            'Rail / road transport',
            'Port / export facilities',
          ],
        },
        {
          t: 'note' as const,
          v: 'Identify: annual production (tons), commodity sold, revenue streams, major customers, critical assets.',
        },
      ],
    },
    {
      id: 'step-2',
      n: 2,
      title: 'Identify Business Interruption Triggers',
      section: 'Part I: 12-Step BI Methodology',
      icon: 'alert' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Determine the events that could stop or reduce production.',
        },
        {
          t: 'list' as const,
          v: [
            'Fire',
            'Explosion',
            'Flood',
            'Slope failure',
            'Conveyor collapse',
            'Processing plant damage',
            'Power failure',
            'Tailings dam incident',
            'Equipment breakdown (if insured)',
            'Natural catastrophes',
          ],
        },
      ],
    },
    {
      id: 'step-3',
      n: 3,
      title: 'Identify Critical Assets',
      section: 'Part I: 12-Step BI Methodology',
      icon: 'target' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Rank equipment according to its impact on production if it fails.',
        },
        {
          t: 'note' as const,
          v: 'These assets generally dictate the required indemnity period — the longer an asset takes to replace, the longer the indemnity period needs to be.',
        },
      ],
    },
    {
      id: 'step-4',
      n: 4,
      title: 'Determine Maximum Foreseeable Loss (MFL)',
      section: 'Part I: 12-Step BI Methodology',
      icon: 'flame' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Estimate the worst realistic insured event — e.g. fire destroys the processing plant, production stops completely, rebuilding takes 16 months. This becomes the basis of the BI scenario.',
        },
        {
          t: 'image' as const,
          src: '/images/mining/processing-plant.jpg',
          alt: 'Mineral processing plant and storage tanks',
          caption: 'The MFL scenario — the asset a total loss centres on',
        },
      ],
    },
    {
      id: 'step-5',
      n: 5,
      title: 'Calculate Gross Profit at Risk',
      section: 'Part I: 12-Step BI Methodology',
      icon: 'chart' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'The insurance definition of Gross Profit differs from accounting gross profit.',
        },
        {
          t: 'formula' as const,
          v: 'Gross Profit = Turnover − Uninsured Variable Costs',
        },
        {
          t: 'twocol' as const,
          a: {
            h: 'Variable costs (deducted)',
            items: [
              'Royalties',
              'Freight',
              'Export charges',
              'Fuel linked directly to production',
              'Consumables directly related to output',
            ],
          },
          b: {
            h: 'Fixed costs (remain insured)',
            items: [
              'Salaries',
              'Administration',
              'Debt servicing',
              'Depreciation (policy-dependent)',
              'Lease costs',
              'Security',
              'Maintenance staff',
            ],
          },
        },
        {
          t: 'table' as const,
          head: ['Item', 'Value (USD)'],
          rows: [
            ['Annual revenue', '500 million'],
            ['Variable costs', '180 million'],
            ['Gross Profit', '320 million'],
          ],
        },
        {
          t: 'groupedlist' as const,
          heading: 'Variable Costs May Include',
          groups: [
            {
              h: 'Drilling & Blasting',
              items: [
                'Explosives (ANFO, emulsions, detonators)',
                'Drill bits, rods, consumables',
                'Contract drilling per meter',
              ],
            },
            {
              h: 'Loading & Hauling',
              items: [
                'Diesel/fuel',
                'Tyres & wear parts',
                'Contract haulage per tonne/km',
              ],
            },
            {
              h: 'Processing / Plant',
              items: [
                'Grinding media',
                'Reagents & chemicals',
                'Process water',
                'Power varying with throughput',
              ],
            },
          ],
          footer:
            'These costs generally rise and fall directly with the number of tonnes mined, moved, or processed.',
        },
      ],
    },
    {
      id: 'step-6',
      n: 6,
      title: 'Determine Maximum Downtime',
      section: 'Part I: 12-Step BI Methodology',
      icon: 'clock' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Estimate debris removal, engineering, procurement, manufacturing, shipping, customs, construction, commissioning and ramp-up.',
        },
        {
          t: 'image' as const,
          src: '/images/mining/cargo-ship-port-cranes.jpg',
          alt: 'Cargo ship loading at port with cranes and containers',
          caption: 'Shipping and customs — the lead time that drives the downtime estimate',
        },
        {
          t: 'table' as const,
          head: ['Activity', 'Months'],
          rows: [
            ['Investigation', '1'],
            ['Design', '2'],
            ['Procurement', '6'],
            ['Shipping', '3'],
            ['Installation', '3'],
            ['Commissioning', '2'],
            ['Total', '17'],
          ],
        },
        {
          t: 'note' as const,
          v: 'Choose an indemnity period longer than the expected recovery.',
        },
      ],
    },
    {
      id: 'step-7',
      n: 7,
      title: 'Estimate Reduction in Turnover',
      section: 'Part I: 12-Step BI Methodology',
      icon: 'trend-down' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Production — and therefore revenue loss — rarely stays at 100% for the whole recovery period. Model the ramp-up.',
        },
        {
          t: 'table' as const,
          head: ['Month', 'Production', 'Revenue Loss'],
          rows: [
            ['1–6', '0%', '100%'],
            ['7–12', '40%', '60%'],
            ['13–18', '80%', '20%'],
          ],
        },
      ],
    },
    {
      id: 'step-8',
      n: 8,
      title: 'Calculate Increased Cost of Working (ICOW)',
      section: 'Part I: 12-Step BI Methodology',
      icon: 'coins' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Estimate additional costs incurred to reduce the interruption. These costs are generally recoverable if economically justified — i.e. if they cost less than the BI loss they prevent.',
        },
        {
          t: 'list' as const,
          v: [
            'Hiring mobile crushers',
            'Contract mining',
            'Temporary generators',
            'Equipment rental',
            'Alternative haul routes',
            'Outsourced processing',
            'Air freight of spare parts',
          ],
        },
      ],
    },
    {
      id: 'step-9',
      n: 9,
      title: 'Consider Supply Chain Dependencies',
      section: 'Part I: 12-Step BI Methodology',
      icon: 'link' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Evaluate dependencies outside the mine\'s direct control.',
        },
        {
          t: 'image' as const,
          src: '/images/mining/conveyor-crossing-yard-aerial.jpg',
          alt: 'Aerial view of a mine logistics yard with conveyor crossings and vehicles',
          caption: 'Dependencies rarely stop at the mine gate',
        },
        {
          t: 'list' as const,
          v: [
            'Single-source suppliers',
            'Explosives supply',
            'Electricity provider',
            'Water supply',
            'Rail network',
            'Port facilities',
            'Fuel suppliers',
          ],
        },
        {
          t: 'note' as const,
          v: 'Also assess contingent business interruption exposures where available.',
        },
      ],
    },
    {
      id: 'step-10',
      n: 10,
      title: 'Assess Risk Mitigation Measures',
      section: 'Part I: 12-Step BI Methodology',
      icon: 'shield' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Document measures that reduce BI exposure — insurers price these in.',
        },
        {
          t: 'image' as const,
          src: '/images/mining/mining-plant-night-lights.jpg',
          alt: 'Mining processing plant and conveyors lit at night',
          caption: 'Redundancy and backup capacity — running around the clock',
        },
        {
          t: 'list' as const,
          v: [
            'Redundant conveyors',
            'Spare transformers',
            'Backup generators',
            'Critical spare parts',
            'Duplicate pumps',
            'Preventive maintenance',
            'Emergency response plans',
            'Fire protection systems',
            'Stockpile capacity',
          ],
        },
        {
          t: 'note' as const,
          v: 'These measures can reduce BI exposure.',
        },
      ],
    },
    {
      id: 'step-11',
      n: 11,
      title: 'Select an Appropriate Indemnity Period',
      section: 'Part I: 12-Step BI Methodology',
      icon: 'calendar' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Match the indemnity period to how long the mine would realistically take to fully recover from its Maximum Foreseeable Loss — not to a generic industry default.',
        },
        {
          t: 'note' as const,
          v: 'Long-lead items such as mills or transformers often justify longer periods. Underground and hard-rock operations with long-lead critical equipment typically sit at the upper end of the range; simpler open-pit operations with more substitutable equipment typically sit lower.',
        },
      ],
    },
    {
      id: 'step-12',
      n: 12,
      title: 'Calculate the BI Sum Insured',
      section: 'Part I: 12-Step BI Methodology',
      icon: 'sigma' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Bring together all the components: Gross Profit, indemnity period, ramp-up curve, ICOW, and any CBI exposures.',
        },
        {
          t: 'formula' as const,
          v: 'BI Sum Insured = (Gross Profit × Indemnity Period in years) + ICOW + CBI',
        },
        {
          t: 'note' as const,
          v: 'This is the amount of insurance needed to protect the business from a total production loss during the recovery period.',
        },
      ],
    },
  ],
  partII: [
    {
      id: 'category-1',
      n: 1,
      title: 'Mining Operation Overview',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'map-pin' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Comprehensive assessment of the mining operation including commodity type, production volume, processing methods, and operational history.',
        },
        {
          t: 'list' as const,
          v: [
            'Commodity type and grade',
            'Annual production capacity',
            'Processing method',
            'Years in operation',
            'Historical production records',
            'Key customers and contracts',
          ],
        },
      ],
    },
    {
      id: 'category-2',
      n: 2,
      title: 'Critical Equipment & Infrastructure',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'gear' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Detailed inventory of critical equipment, replacement costs, and lead times.',
        },
        {
          t: 'image' as const,
          src: '/images/mining/bucket-wheel-excavator.jpg',
          alt: 'Heavy mining machinery — bucket-wheel excavator in operation',
          caption: 'The equipment schedule this category is built from',
        },
        {
          t: 'list' as const,
          v: [
            'Primary mill specifications',
            'Conveyor systems',
            'Power infrastructure',
            'Water supply systems',
            'Tailings management',
            'Replacement lead times',
          ],
        },
      ],
    },
    {
      id: 'category-3',
      n: 3,
      title: 'Maintenance & Reliability Programs',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'wrench' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of preventive maintenance practices and equipment reliability.',
        },
        {
          t: 'list' as const,
          v: [
            'CMMS system implementation',
            'Predictive maintenance techniques',
            'Maintenance compliance rates',
            'Equipment failure history',
            'Spare parts inventory strategy',
            'Contractor qualifications',
          ],
        },
      ],
    },
    {
      id: 'category-4',
      n: 4,
      title: 'Fire & Explosion Risk',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'flame' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of fire and explosion hazards specific to mining operations.',
        },
        {
          t: 'image' as const,
          src: '/images/mining/blasting-operations.jpg',
          alt: 'Blasting operations at an open-pit mine',
          caption: 'Explosive storage and handling — the sharpest end of this category',
        },
        {
          t: 'list' as const,
          v: [
            'Explosive storage and handling',
            'Fire detection systems',
            'Suppression systems',
            'Combustible materials management',
            'Hot work procedures',
            'Emergency response capability',
          ],
        },
      ],
    },
    {
      id: 'category-5',
      n: 5,
      title: 'Geotechnical & Slope Stability',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'mountain' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of slope stability and geotechnical risks.',
        },
        {
          t: 'image' as const,
          src: '/images/mining/open-pit-bench-terraces-aerial.jpg',
          alt: 'Aerial view of terraced open-pit mine benches',
          caption: 'Every bench angle is a slope-stability decision',
        },
        {
          t: 'list' as const,
          v: [
            'Slope angle and height',
            'Geological assessment',
            'Monitoring systems',
            'Stability studies',
            'Pit design reviews',
            'Remediation programs',
          ],
        },
      ],
    },
    {
      id: 'category-6',
      n: 6,
      title: 'Tailings Management',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'droplet' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of tailings dam design, construction, and management.',
        },
        {
          t: 'image' as const,
          src: '/images/mining/tailings-pond-processing-plant-aerial.jpg',
          alt: 'Aerial view of a tailings pond and processing plant',
          caption: 'Design, monitoring and regulatory compliance, in one frame',
        },
        {
          t: 'list' as const,
          v: [
            'Dam design and engineering',
            'Construction standards',
            'Monitoring and instrumentation',
            'Maintenance programs',
            'Emergency action plans',
            'Regulatory compliance',
          ],
        },
      ],
    },
    {
      id: 'category-7',
      n: 7,
      title: 'Water & Environmental Management',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'droplet' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of water management and environmental controls.',
        },
        {
          t: 'list' as const,
          v: [
            'Water supply sources',
            'Treatment systems',
            'Discharge management',
            'Environmental permits',
            'Spill prevention',
            'Regulatory compliance',
          ],
        },
      ],
    },
    {
      id: 'category-8',
      n: 8,
      title: 'Power & Utilities',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'bolt' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of power supply reliability and backup systems.',
        },
        {
          t: 'image' as const,
          src: '/images/mining/night-shift.jpg',
          alt: 'Mining operation running under lights at night',
          caption: 'Power reliability, tested every night shift',
        },
        {
          t: 'list' as const,
          v: [
            'Primary power source',
            'Backup generation capacity',
            'Transformer redundancy',
            'Fuel storage',
            'Utility contracts',
            'Load management systems',
          ],
        },
      ],
    },
    {
      id: 'category-9',
      n: 9,
      title: 'Transportation & Logistics',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'truck' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of transportation infrastructure and logistics.',
        },
        {
          t: 'image' as const,
          src: '/images/mining/aerial-conveyor.jpg',
          alt: 'Aerial view of mine conveyor and transport infrastructure',
          caption: 'Haul roads, rail, conveyors and port — one continuous chain',
        },
        {
          t: 'list' as const,
          v: [
            'Haul road conditions',
            'Rail infrastructure',
            'Port facilities',
            'Alternative routes',
            'Logistics contracts',
            'Supply chain resilience',
          ],
        },
      ],
    },
    {
      id: 'category-10',
      n: 10,
      title: 'Supply Chain & Suppliers',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'package' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of critical suppliers and supply chain dependencies.',
        },
        {
          t: 'list' as const,
          v: [
            'Explosives suppliers',
            'Reagent suppliers',
            'Equipment manufacturers',
            'Single-source dependencies',
            'Supplier financial stability',
            'Contingency arrangements',
          ],
        },
      ],
    },
    {
      id: 'category-11',
      n: 11,
      title: 'Safety & Occupational Health',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'shield-check' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of safety programs and occupational health management.',
        },
        {
          t: 'image' as const,
          src: '/images/mining/mining-shovel-dusk-worker.jpg',
          alt: 'Mining shovel at dusk with a site worker for scale',
          caption: 'Safety systems, measured against real site conditions',
        },
        {
          t: 'list' as const,
          v: [
            'Safety management systems',
            'Incident reporting',
            'Training programs',
            'PPE requirements',
            'Medical surveillance',
            'Regulatory compliance',
          ],
        },
      ],
    },
    {
      id: 'category-12',
      n: 12,
      title: 'Management & Governance',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'users' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of management capability and corporate governance.',
        },
        {
          t: 'list' as const,
          v: [
            'Management experience',
            'Technical expertise',
            'Decision-making structure',
            'Risk management policies',
            'Insurance history',
            'Financial stability',
          ],
        },
      ],
    },
    {
      id: 'category-13',
      n: 13,
      title: 'Regulatory & Compliance',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'document' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of regulatory compliance and legal requirements.',
        },
        {
          t: 'list' as const,
          v: [
            'Mining permits and licenses',
            'Environmental permits',
            'Safety regulations',
            'Labor laws compliance',
            'Tax compliance',
            'Dispute history',
          ],
        },
      ],
    },
    {
      id: 'category-14',
      n: 14,
      title: 'Financial Performance',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'chart' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of financial performance and stability.',
        },
        {
          t: 'list' as const,
          v: [
            'Revenue trends',
            'Profitability',
            'Cash flow',
            'Debt levels',
            'Working capital',
            'Financial forecasts',
          ],
        },
      ],
    },
    {
      id: 'category-15',
      n: 15,
      title: 'Insurance & Risk Transfer',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'umbrella' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of existing insurance and risk transfer arrangements.',
        },
        {
          t: 'list' as const,
          v: [
            'Current insurance policies',
            'Coverage gaps',
            'Claims history',
            'Loss prevention programs',
            'Risk mitigation investments',
            'Insurance requirements',
          ],
        },
      ],
    },
    {
      id: 'category-16',
      n: 16,
      title: 'Contingency & Business Continuity',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'refresh' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of contingency planning and business continuity.',
        },
        {
          t: 'list' as const,
          v: [
            'Emergency response plans',
            'Business continuity plans',
            'Backup systems',
            'Redundancy measures',
            'Crisis management',
            'Recovery procedures',
          ],
        },
      ],
    },
    {
      id: 'category-17',
      n: 17,
      title: 'Community & Stakeholder Relations',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'users' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of community relations and stakeholder management.',
        },
        {
          t: 'list' as const,
          v: [
            'Community engagement',
            'Social responsibility programs',
            'Dispute resolution',
            'Government relations',
            'NGO interactions',
            'Reputational risks',
          ],
        },
      ],
    },
    {
      id: 'category-18',
      n: 18,
      title: 'Emerging Risks & Future Outlook',
      section: 'Part II: 18-Category Underwriting Questionnaire',
      icon: 'compass' as const,
      blocks: [
        {
          t: 'p' as const,
          v: 'Assessment of emerging risks and future business outlook.',
        },
        {
          t: 'list' as const,
          v: [
            'Climate change impacts',
            'Commodity price volatility',
            'Technology changes',
            'Regulatory changes',
            'Market trends',
            'Strategic initiatives',
          ],
        },
      ],
    },
  ],
};
