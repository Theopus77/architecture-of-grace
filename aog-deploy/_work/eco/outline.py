# Economics, K–12 — the course arc. Our own wording, following the Illinois
# Social Science (economics and financial literacy) standards and the Voluntary
# National Content Standards in Economics: wants, needs, work and money in K–2;
# scarcity, producers, markets and trade in 3–5; the economic way of thinking,
# markets, personal finance and the wider economy in 6–8; microeconomics in
# 9–10; macroeconomics and the world economy in 11–12. Topics guide the
# writers; story = the chapter's opening narrative hook.
#
# NUMBERING (2026-09-27): the 9–10 and 11–12 units keep their original numbers
# (units 1–8, chapters 1–16) because their pages, banners, short links and
# saved progress already exist. The K–2, 3–5 and 6–8 bands were added later
# and carry the NEXT numbers (units 9–18, chapters 17–36). The UNITS list is
# ordered by BAND, not by n, because the builder groups the contents page in
# list order. See _work/course/RELIGION_PLAN.md for the renumbering decision.

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 (units 9–11, chapters 17–22) ══════════════════════════════
 dict(n=9, band="k-2", title="Wants, Needs and Choices", strand="Foundations", chapters=[
  dict(n=17, title="Needs and Wants", strand="Choices",
       topics="a need is something you must have to live and stay well (food, water, clothes, a home); a want is something nice to have; sorting pictures into needs and wants; when you cannot have both, you choose — and give one up; \"scarce\" means there is not enough for everyone who wants it; a class vote on one thing to buy with one jar of coins.",
       story="One birthday dollar, two things on the shelf, and only one can come home"),
  dict(n=18, title="Goods and Services", strand="Goods and Services",
       topics="a good is a thing you can hold (an apple, a book, shoes); a service is work someone does for you (a haircut, a bus ride, a doctor's visit); people who make goods and people who give services in the neighborhood; a job is work someone is paid for; matching workers to what they make or do; what a school buys and what it hires.",
       story="A walk down Main Street: what is sold in each window, and who is working inside"),
 ]),
 dict(n=10, band="k-2", title="Money, Saving and Spending", strand="Money", chapters=[
  dict(n=19, title="What Money Is For", strand="Money",
       topics="before money, people traded things (a trade means both sides agree); money makes trading easy; pennies, nickels, dimes, quarters and dollar bills — what each is worth; paying and getting change in simple amounts; money can be earned by working; a price tells how much money a thing costs.",
       story="A trade at the lunch table goes wrong, and the class invents money"),
  dict(n=20, title="Save, Spend or Share", strand="Saving",
       topics="a piggy bank or a jar for saving; waiting to buy something bigger later; three jars — save, spend, share; earning money for chores or a lemonade stand; a simple plan — \"I want a $5 book; I get $1 a week; five weeks\"; giving some to help others; a bank keeps money safe.",
       story="Deshawn's three jars, and the week the spend jar was empty"),
 ]),
 dict(n=11, band="k-2", title="Workers, Makers and Markets", strand="Producers and Consumers", chapters=[
  dict(n=21, title="From Farm to Table", strand="Producers",
       topics="a producer makes goods or gives a service; a consumer uses them; where bread comes from — a farmer grows wheat, a mill grinds it, a bakery bakes, a store sells, a family eats; Illinois farms — corn and soybeans; a truck and a train carry things; every step is a job; you are a consumer every day and sometimes a producer.",
       story="One loaf of bread and the six people whose hands it passed through"),
  dict(n=22, title="A Class Market Day", strand="Markets",
       topics="a market is where buyers and sellers meet; a seller sets a price; a buyer decides; if nobody buys, the price may go down; if everyone wants it, it sells out; making a product for market day (bookmarks, cards); counting the money after; fair rules — honest signs, one price for everyone, take turns.",
       story="Room 12 sets up nine tables, and the bookmark table sells out before recess"),
 ]),

 # ══════════════════════════════ 3–5 (units 12–14, chapters 23–28) ══════════════════════════════
 dict(n=12, band="3-5", title="Scarcity and the Choices People Make", strand="Foundations", chapters=[
  dict(n=23, title="Why We Cannot Have Everything", strand="Scarcity and Opportunity Cost",
       topics="scarcity — wants are bigger than what there is; resources — natural, human and capital, with examples; every choice has a cost — the opportunity cost is the next-best thing you gave up; a decision grid (choices across the top, what matters down the side); families, schools and towns all face scarcity; incentives — rewards and costs that change what people choose.",
       story="The student council has $200 and four good ideas"),
  dict(n=24, title="Producers, Consumers and How Work Gets Done", strand="Production",
       topics="producers and consumers; productive resources in a pizza shop (the oven, the cook, the flour); specialization — doing one job well; the division of labor — an assembly line for paper airplanes, timed; why specialization means we depend on each other (interdependence); entrepreneurs — people who start a business and take the risk; a kid business.",
       story="Two teams fold paper airplanes: one does every step alone, one splits the work"),
 ]),
 dict(n=13, band="3-5", title="Markets, Prices and Money", strand="Markets", chapters=[
  dict(n=25, title="Supply, Demand and the Price", strand="Prices",
       topics="a market is buyers and sellers; demand — how much people want to buy at a price; supply — how much sellers will offer; when many want and few are for sale the price goes up, and the other way round; competition — more sellers, better prices and service; a price is a signal; a lemonade stand on a hot day and a cold day.",
       story="Two lemonade stands, one hot Saturday, and a price war on Elm Street"),
  dict(n=26, title="Money, Banks and Interest", strand="Money",
       topics="barter and its problem; money as a medium of exchange, a way to measure value and a way to save; coins, bills and money in a bank account; what a bank does — keeps deposits safe, lends money; interest — the bank pays you for saving, you pay the bank for borrowing; a simple interest example ($100 at 5% for a year); a budget for an allowance — income, spending, saving.",
       story="Ana's $50 birthday money, and what the bank does with it while she waits"),
 ]),
 dict(n=14, band="3-5", title="Trade, Government and the Community", strand="Trade and Government", chapters=[
  dict(n=27, title="Trade Near and Far", strand="Trade",
       topics="why people and countries trade — nobody makes everything; imports and exports in plain words; Illinois exports (corn, soybeans, machinery) and what Illinois imports; Chicago's rail yards, O'Hare and the Port; a world map of where the things in a backpack were made; trade makes us interdependent; when trade is fair and when it is not.",
       story="Everything in one backpack, traced back to the country it came from"),
  dict(n=28, title="Taxes, Public Goods and Jobs", strand="Government and Careers",
       topics="a tax is money people pay to the government; what taxes pay for — schools, roads, parks, police, firefighters, libraries; public goods everyone can use versus private goods you buy; government workers and their jobs; careers — what people earn depends on skills, education and demand; planning for a job you might want; volunteers and nonprofits in the community.",
       story="A pothole, a library card and a fire truck — three things nobody bought alone"),
 ]),

 # ══════════════════════════════ 6–8 (units 15–18, chapters 29–36) ══════════════════════════════
 dict(n=15, band="6-8", title="The Economic Way of Thinking", strand="Foundations", chapters=[
  dict(n=29, title="Scarcity, Incentives and Trade-offs", strand="Economic Reasoning",
       topics="scarcity as the starting point; the factors of production — land, labor, capital, entrepreneurship; opportunity cost, with a worked choice; thinking at the margin — one more hour, one more slice; cost-benefit analysis of a real decision; incentives, positive and negative, and how they change behavior; the difference between a need and a want as economists see it.",
       story="A summer job or summer school: the spreadsheet a family made at the kitchen table"),
  dict(n=30, title="Economic Systems Around the World", strand="Systems",
       topics="the three questions every economy answers — what, how, for whom; traditional, command, market and mixed economies with examples; the United States as a mixed market economy; the roles of government — rules, public goods, safety nets; property rights and why they matter; comparing two countries' systems; how systems change over time.",
       story="Three students' grandparents describe three very different ways to get bread"),
 ]),
 dict(n=16, band="6-8", title="Markets in Action", strand="Markets", chapters=[
  dict(n=31, title="Supply and Demand on a Graph", strand="Supply and Demand",
       topics="the law of demand and a demand schedule and curve; the law of supply; equilibrium — where they meet — read from a table; surplus and shortage; what shifts demand (income, tastes, substitutes, the number of buyers) and supply (costs, technology, the number of sellers); a real price change explained — concert tickets, gas, a video game at launch.",
       story="A new sneaker drops at 10 a.m., and by noon the resale price has doubled"),
  dict(n=32, title="Businesses, Competition and Profit", strand="Firms",
       topics="revenue, costs and profit with a worked example; sole proprietorships, partnerships and corporations; competition — why more sellers usually mean lower prices and better products; monopoly in plain words and why governments watch for it; entrepreneurship — risk and reward; a business plan for a school store; workers, wages and unions in brief.",
       story="A school store's first month: the receipts, the rent and the leftover hoodies"),
 ]),
 dict(n=17, band="6-8", title="Personal Finance", strand="Financial Literacy", chapters=[
  dict(n=33, title="Earning, Budgeting and Saving", strand="Budgeting",
       topics="income — wages, salaries, tips, allowance; a pay stub and where the money goes (gross versus net, taxes, deductions); a monthly budget with needs, wants and savings; the 50/30/20 idea as one example; saving goals and emergency funds; simple versus compound interest with a worked example; savings accounts and why starting early matters.",
       story="Marcus's first pay stub, and the number that was smaller than he expected"),
  dict(n=34, title="Credit, Borrowing and Protecting Your Money", strand="Credit and Risk",
       topics="credit — borrowing now, paying later with interest; debit versus credit cards; APR in plain words; what a credit score is and what changes it; loans — car, student, mortgage — in outline; scams, phishing and identity theft, and how to protect yourself; insurance — what it is for; comparing prices and reading a contract before signing.",
       story="A phone offer that says $0 down, and the fine print that says something else"),
 ]),
 dict(n=18, band="6-8", title="The Nation and the World", strand="The Wider Economy", chapters=[
  dict(n=35, title="Government, Taxes and the Whole Economy", strand="Macroeconomics Begins",
       topics="GDP as the size of the economy in plain words; growth, recession and the business cycle; inflation — why prices rise and what it does to a dollar; unemployment — who counts; taxes — income, sales, property — and what they fund; the federal budget in rounded shares; the Federal Reserve in one paragraph — it watches prices and jobs and sets a key interest rate.",
       story="A candy bar cost a nickel in 1950 — was Grandma richer or poorer than us?"),
  dict(n=36, title="Global Trade and Development", strand="The World Economy",
       topics="imports, exports and the trade balance; comparative advantage in a simple two-country example; tariffs and who pays; currencies and exchange rates — a trip abroad; globalization — supply chains for one phone; why some countries are richer — education, health, institutions, trade; Chicago as a trade hub; the course in one page — the economic way of thinking.",
       story="One phone: designed in one country, built in another, sold in a third"),
 ]),

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

 # K–8 units (added 2026-09-27): no hub rooms yet — the Daily Drafts "Economics" spiral for the band and the Social Studies economics room.
 9:  [("/drops/economics/K", "Daily Drafts — Economics, grades K–2")],
 10: [("/drops/economics/1", "Daily Drafts — Economics, grades K–2")],
 11: [("/drops/economics/2", "Daily Drafts — Economics, grades K–2")],
 12: [("/drops/economics/3", "Daily Drafts — Economics, grades 3–5"), ("/ec1", "Scarcity, choice and opportunity cost — the room")],
 13: [("/drops/economics/4", "Daily Drafts — Economics, grades 3–5"), ("/ec2", "Supply, demand and the market — the room")],
 14: [("/drops/economics/5", "Daily Drafts — Economics, grades 3–5"), ("/ec8", "Trade, taxes and the world economy — the room")],
 15: [("/drops/economics/6", "Daily Drafts — Economics, grades 6–8"), ("/s24", "Economics — the Social Studies room"), ("/ec1", "Scarcity, choice and opportunity cost — the room")],
 16: [("/drops/economics/7", "Daily Drafts — Economics, grades 6–8"), ("/ec2", "Supply, demand and the market — the room"), ("/ec4", "Competition, firms and market structure — the room")],
 17: [("/drops/economics/7", "Daily Drafts — Economics, grades 6–8"), ("/ec7", "Money, banking and the Federal Reserve — the room")],
 18: [("/drops/economics/8", "Daily Drafts — Economics, grades 6–8"), ("/ec5", "Measuring the economy — the room"), ("/ec8", "Trade, taxes and the world economy — the room")],
}
