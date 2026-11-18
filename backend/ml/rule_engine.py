import os
import sys

def get_conservation_action_plans(risk_level, root_causes=None):
    """
    Rule-based Conservation Planning Engine:
    Maps identified risk level and SHAP root causes into prioritized, sector-specific
    conservation action plans.
    """
    plans = []

    if risk_level == "Critical":
        plans.extend([
            {
                "id": "ACT-CRIT-01",
                "priority": "P1 - Critical Immediate",
                "sector": "Agricultural & Deep Extraction",
                "title": "Enforce Emergency Borewell Draw Caps",
                "expected_impact": "Prevents irreversible aquifer depressurization",
                "description": "Institute mandatory moratorium on private industrial borewell extraction. Limit agricultural deep wells to timed rotational power supply (4 hours/day).",
                "steps": [
                    "Issue district magistrate directive for Zone 2 & 4 extraction limits.",
                    "Audit high-capacity commercial bottling and tanker operations.",
                    "Activate regional tanker fleet for emergency residential relief."
                ]
            },
            {
                "id": "ACT-CRIT-02",
                "priority": "P1 - Critical Immediate",
                "sector": "Municipal Supply Management",
                "title": "Implement Phased Pressure Reduction & Rationing",
                "expected_impact": "Saves 25-35% daily distribution volume",
                "description": "Reduce distribution pipeline head pressure by 30% during off-peak hours to cut transmission leakages. Transition urban wards to alternate-day supply schedule.",
                "steps": [
                    "Calibrate telemetry pressure release valves across trunk mains.",
                    "Publish civic notification for ward-wise supply schedules.",
                    "Deploy mobile acoustic leak detection teams across aging distribution nodes."
                ]
            },
            {
                "id": "ACT-CRIT-03",
                "priority": "P2 - High Priority",
                "sector": "Ecosystem & Water Bodies",
                "title": "Emergency Desilting & Natural Catchment Dredging",
                "expected_impact": "Restores 15% surface storage capacity before pre-monsoon showers",
                "description": "Clear silt build-up from urban percolation tanks and storm channels so upcoming rainfall infiltrates into aquifers without flash runoff.",
                "steps": [
                    "Mobilize earthmovers for primary percolation lake basins.",
                    "Clear secondary feeder feeder nalas from urban debris.",
                    "Construct temporary earthen bunds to trap late-season dew and runoff."
                ]
            }
        ])

    elif risk_level == "High":
        plans.extend([
            {
                "id": "ACT-HIGH-01",
                "priority": "P2 - High Priority",
                "sector": "Commercial & Industrial",
                "title": "Mandate Industrial Zero-Liquid-Discharge & Recycling",
                "expected_impact": "Conserves 20% municipal bulk draw",
                "description": "Require construction sites, automobile servicing, and manufacturing units to substitute municipal freshwater with treated effluent wastewater.",
                "steps": [
                    "Inspect on-site sewage treatment plants (STPs) in major housing societies.",
                    "Prohibit using treated freshwater for landscaping and construction curing.",
                    "Offer municipal rebates for certified tertiary recycling units."
                ]
            },
            {
                "id": "ACT-HIGH-02",
                "priority": "P2 - High Priority",
                "sector": "Community & Domestic",
                "title": "Rooftop Rainwater Harvesting Verification Drive",
                "expected_impact": "Direct aquifer recharge of up to 40,000 L/household annually",
                "description": "Inspect commercial and residential buildings (>2,400 sq.ft) for functional recharge pits before monsoon onset.",
                "steps": [
                    "Deploy civic ward volunteers for filter mesh and soak-pit inspections.",
                    "Distribute subsidized recharge well filter cartridges.",
                    "Set up public advisory helpline for citizen recharge queries."
                ]
            }
        ])

    elif risk_level == "Medium":
        plans.extend([
            {
                "id": "ACT-MED-01",
                "priority": "P3 - Moderate Alert",
                "sector": "Urban Infrastructure",
                "title": "Accelerated Non-Revenue Water (NRW) Leak Detection",
                "expected_impact": "Reduces distribution transit loss below 12%",
                "description": "Perform systematic acoustic survey of secondary distribution mains to identify underground joint seepages before summer peaks.",
                "steps": [
                    "Prioritize older GI distribution pipes in core city wards.",
                    "Replace corroded valves and junction gaskets.",
                    "Monitor nighttime minimum flows through digital flow meters."
                ]
            },
            {
                "id": "ACT-MED-02",
                "priority": "P3 - Moderate Alert",
                "sector": "Public Engagement",
                "title": "Voluntary Household Water Budgeting Campaign",
                "expected_impact": "8-12% reduction in peak domestic consumption",
                "description": "Engage schools, resident welfare associations, and local media with practical conservation techniques.",
                "steps": [
                    "Publish weekly reservoir storage percentages in local newspapers.",
                    "Promote low-flow aerator nozzles for domestic taps.",
                    "Recognize water-positive residential communities with civic awards."
                ]
            }
        ])

    else: # Low Risk
        plans.extend([
            {
                "id": "ACT-LOW-01",
                "priority": "P4 - Baseline Monitoring",
                "sector": "Routine Operations",
                "title": "Aquifer State Monitoring & Baseline Calibration",
                "expected_impact": "Maintains hydrological data fidelity",
                "description": "Water availability is within stable seasonal limits. Maintain routine telemetry logger synchronization and reservoir intake maintenance.",
                "steps": [
                    "Record weekly piezometer groundwater levels.",
                    "Maintain silt traps in intake weir chambers.",
                    "Update baseline hydrological models with new seasonal weather data."
                ]
            }
        ])

    # Check for specific root cause additions (e.g. if temperature is extreme)
    if root_causes:
        for rc in root_causes:
            if "temperature" in rc.get("driver", "").lower() and risk_level in ["High", "Critical"]:
                plans.append({
                    "id": "ACT-HEAT-01",
                    "priority": "P2 - High Priority",
                    "sector": "Evaporation Mitigation",
                    "title": "Reservoir Evaporation Retardant Application",
                    "expected_impact": "Reduces open-surface evaporation by 15-20%",
                    "description": "High temperatures detected. Deploy bio-degradable chemical monolayer (cetyl alcohol) or modular floating solar arrays on key balancing reservoirs.",
                    "steps": [
                        "Assess wind shear on Thumbay balancing reservoir surface.",
                        "Apply eco-safe monolayer spray during afternoon thermal peaks.",
                        "Measure daily pan-evaporation reduction."
                    ]
                })
                break

    return plans

if __name__ == "__main__":
    plans = get_conservation_action_plans("Critical", [{"driver": "Elevated thermal temperature"}])
    print(f"Generated {len(plans)} plans for Critical:")
    for p in plans:
        print(f" - [{p['priority']}] {p['title']}")
