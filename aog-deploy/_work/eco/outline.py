# Economics, Grades 9–12 — the course arc. Our own wording, following the
# Illinois Social Science (economics) standards and the Voluntary National
# Content Standards in Economics: microeconomics in 9–10, macroeconomics and
# the world economy in 11–12. Topics guide the writers; story = the chapter's
# opening narrative hook.
#
# Units number 1–8 straight through the course; chapters 1–16. Each unit
# grows out of one existing room on economics-hub.html (LINKS below).

BANDS = [
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ 9–10 ══════════════════════════════
 dict(n=1, band="9-10", title="Scarcity, Choice and Opportunity Cost", strand="Foundations", chapters=[
  dict(n=1, title="Scarcity Is Not a Shortage", strand="The Economic Problem",
       topics="wants are unlimited, resources are not; scarcity versus shortage; the factors of production — land, labor, capital, entrepreneurship; the three questions every economy answers (what, how, for whom); economic systems — traditional, command, market, mixed; incentives; the economic way of thinking.",
       story="Twenty-four hours, and everything a student wants to do with them"),
  dict(n=2, title="Opportunity Cost and the Margin", strand="Choice",
       topics="opportunity cost is the next-best alternative, one thing not a list; trade-offs; the production possibilities curve in words and a table — efficiency, growth, the bowed shape; thinking at the margin — marginal cost and marginal benefit; sunk costs; cost-benefit analysis of a real decision (a job, a class, a purchase); specialization and why people trade.",
       story="A Saturday shift at work or the championship game — what does it really cost?"),
 ]),
 dict(n=2, band="9-10", title="Supply, Demand and the Market", strand="Markets", chapters=[
  dict(n=3, title="Demand and Supply", strand="The Curves",
       topics="the law of demand and a demand schedule; the law of supply and a supply schedule; along the curve versus the whole curve — a change in price versus a change in something else; shifters of demand (income, tastes, prices of substitutes and complements, expectations, number of buyers); shifters of supply (input costs, technology, taxes and subsidies, expectations, number of sellers).",
       story="A heat wave and the price of lemonade on one block"),
  dict(n=4, title="Equilibrium and Elasticity", strand="Market Outcomes",
       topics="equilibrium price and quantity from a table; surplus and shortage and how price moves; what happens when a curve shifts — the four cases; both curves shifting; elasticity of demand — the formula in words, elastic versus inelastic, what makes a good elastic (substitutes, share of budget, necessity, time); total revenue and elasticity; elasticity of supply.",
       story="Concert tickets: why the resale price is nothing like the face price"),
 ]),
 dict(n=3, band="9-10", title="Prices, Controls and Market Failure", strand="Markets", chapters=[
  dict(n=5, title="Ceilings, Floors and Rationing", strand="Price Controls",
       topics="what prices do — signal, ration, motivate; price ceilings make shortages and price floors make surpluses, but only when they bind; rent control and the minimum wage as the standard examples, with the arguments on each side; non-price rationing — lines, lotteries, favoritism; black markets; taxes and subsidies and who really pays (tax incidence in plain terms).",
       story="Gas lines in 1970s America, and what a price ceiling did"),
  dict(n=6, title="Externalities and Public Goods", strand="Market Failure",
       topics="market failure defined; externalities — pollution as a negative, vaccines and education as positives; how governments respond (taxes, subsidies, regulation, tradable permits); public goods — non-rival and non-excludable, the free-rider problem; common resources and the tragedy of the commons; imperfect information; the government's economic roles and their limits.",
       story="A factory upstream, a town downstream, and a bill nobody sent"),
 ]),
 dict(n=4, band="9-10", title="Competition, Firms and Market Structure", strand="Firms", chapters=[
  dict(n=7, title="Costs, Revenue and the Firm", strand="The Firm",
       topics="how a business works — revenue, costs, profit; fixed and variable costs; total, average and marginal cost; diminishing returns; economies of scale; the profit-maximizing rule (marginal revenue = marginal cost) in plain terms; types of business organization — sole proprietorship, partnership, corporation; entrepreneurship; a small business in Chicago walked through.",
       story="A food truck's first month: the numbers on the napkin"),
  dict(n=8, title="The Four Market Structures", strand="Market Structure",
       topics="count the sellers, check how hard it is to enter, ask whether the buyer can leave; perfect competition, monopolistic competition, oligopoly, monopoly; barriers to entry; market power and price setting; natural monopolies and regulation; antitrust — Sherman Act (1890), Standard Oil, the Chicago School's influence in brief; advertising and product differentiation; labor markets and unions in brief.",
       story="One wireless carrier in a small town versus twenty pizza places in a city"),
 ]),

 # ══════════════════════════════ 11–12 ══════════════════════════════
 dict(n=5, band="11-12", title="Measuring the Economy", strand="Macroeconomics", chapters=[
  dict(n=9, title="GDP: What It Counts and What It Misses", strand="Output",
       topics="GDP defined — final goods and services, within a country, in a year; the expenditure approach C + I + G + NX with a worked example; real versus nominal GDP and the price index; GDP per capita and comparing countries; what GDP leaves out — unpaid work, the underground economy, leisure, the environment, distribution; alternatives and supplements; U.S. GDP in rounded terms.",
       story="Counting everything made in one Illinois town for one year"),
  dict(n=10, title="Prices and Jobs: The CPI and Unemployment", strand="Inflation and Employment",
       topics="the CPI — a market basket, a base year, the index; the inflation rate as a percent change; purchasing power and real wages; who wins and who loses from inflation; deflation; the labor force, who counts as unemployed, the unemployment rate formula with a worked example; types of unemployment — frictional, structural, cyclical, seasonal; discouraged workers and the participation rate; full employment.",
       story="Grandpa's first job paid $1.60 an hour — was that a lot?"),
 ]),
 dict(n=6, band="11-12", title="The Business Cycle and Fiscal Policy", strand="Macroeconomics", chapters=[
  dict(n=11, title="Expansion, Peak, Contraction, Trough", strand="The Business Cycle",
       topics="the phases; recession defined; leading, coincident and lagging indicators; aggregate demand and aggregate supply in words; causes of recessions and booms; the Great Depression and the 2007–09 recession in brief and rounded; economic growth in the long run — productivity, capital, education, technology; the 2020 recession in brief.",
       story="Help-wanted signs disappear, then reappear: reading a downtown in two years"),
  dict(n=12, title="Taxes, Spending and the Budget", strand="Fiscal Policy",
       topics="fiscal policy defined — Congress and the President; expansionary and contractionary policy; automatic stabilizers — unemployment insurance, progressive taxes; the multiplier in plain terms; the federal budget — where the money comes from and where it goes in rounded shares; deficits and the national debt; the arguments about debt; state and local budgets and Illinois's; the lags and politics of fiscal policy.",
       story="A stimulus check arrives — where does it go, and what does it do?"),
 ]),
 dict(n=7, band="11-12", title="Money, Banking and the Federal Reserve", strand="Money and Banking", chapters=[
  dict(n=13, title="Money and Banks", strand="Money",
       topics="the three functions of money; commodity, representative and fiat money; the properties of good money; what the dollar rests on; how a bank works — deposits, loans, reserves, the money multiplier in a simple example; the FDIC; simple versus compound interest with worked examples; APR; credit scores in plain terms; saving, investing and risk in brief.",
       story="A jar of coins, a bank account, and what happens to the money in between"),
  dict(n=14, title="The Federal Reserve and Monetary Policy", strand="Monetary Policy",
       topics="the Fed's structure — the Board of Governors, twelve Reserve Banks including Chicago, the FOMC; the dual mandate; the tools the Fed actually uses — the federal funds rate target, interest on reserves, open market operations, the discount rate, reserve requirements in history; how a rate change reaches a car loan; inflation targeting at 2%; the Fed in 2008 and 2020 in brief; independence and accountability.",
       story="Eight meetings a year in Washington, and the rate on a car loan in Peoria"),
 ]),
 dict(n=8, band="11-12", title="Trade, Taxes and the World Economy", strand="The World Economy", chapters=[
  dict(n=15, title="Comparative Advantage and Trade Policy", strand="International Trade",
       topics="absolute and comparative advantage with a two-country, two-good worked example; gains from trade; exports, imports and the trade balance; trade deficits — what they mean and do not mean; tariffs and quotas and who pays; the arguments for and against protection — infant industries, national security, jobs, consumers; trade agreements and the WTO in brief; Illinois's exports.",
       story="Soybeans out of Illinois, electronics in: one ship's manifest"),
  dict(n=16, title="Exchange Rates, Taxes and Development", strand="Global Economics",
       topics="exchange rates — what a stronger and weaker dollar mean for travelers, exporters and importers; supply and demand for currencies; progressive, regressive and proportional taxes with worked examples; sales, income, property and payroll taxes; economic development — why some countries are richer, the role of institutions, education, health and trade; poverty and inequality measured in plain terms; the course in one page — the economic way of thinking.",
       story="A family trip to Mexico and the exchange rate on the airport board"),
 ]),
]

# Rooms already on the site that belong to each unit — nothing gets deleted.
LINKS = {
 1: [("/ec1", "Scarcity, choice and opportunity cost — the room"), ("/s24", "Economics — the Social Studies room")],
 2: [("/ec2", "Supply, demand and the market — the room")],
 3: [("/ec3", "Prices, controls and market failure — the room")],
 4: [("/ec4", "Competition, firms and market structure — the room")],
 5: [("/ec5", "Measuring the economy — the room")],
 6: [("/ec6", "The business cycle and fiscal policy — the room")],
 7: [("/ec7", "Money, banking and the Federal Reserve — the room")],
 8: [("/ec8", "Trade, taxes and the world economy — the room")],
}
