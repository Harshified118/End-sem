# 🎤 DropOrCop: Harsh Kumar's End-Semester Defense & Viva Notes
#presentation #viva #droporcop #machine-learning #sitm

> [!ABSTRACT] Quick Deliverable Links
> - **PowerPoint Slide Deck:** [[DropOrCop_Defense_Presentation.pptx]] *(11 Widescreen Slides with embedded speaker notes)*
> - **Detailed Presenter Guide:** [[docs/harsh_presentation_guide.md]]
> - **Teammate Guides:** [[docs/anamika_presentation_guide.md]] | [[docs/sinthoiba_presentation_guide.md]]
> - **Official PRD:** [[docs/PRD_DropOrCop_Group_G.docx]]

---

## 🍽️ The 30-Second "Restaurant Analogy" (Examiner Hook)

> [!TIP] Use this whenever an examiner asks: *"Harsh, give me the 30-second summary of what your system does and how the team split the work."*

```
"Think of DropOrCop like a high-end restaurant:
 1. Harsh (Me): The Chef — Cleaned 94,355 raw ingredients (StockX data) and created the secret recipe (Random Forest ML pipeline).
 2. Anamika (Phase 4): The Food Inspector — Tested 18,871 unseen dishes to verify 99.02% accuracy and zero price bias.
 3. Sinthoiba (Phase 5): The Fast Waiter — Built the FastAPI backend serving instant predictions in <45ms.
 4. Himesh (Phase 6): The Menu & Dining Room Designer — Built the luxury dark Next.js web application with live COP/DROP stamps."
```

---

## 🗣️ Harsh's Slide-by-Slide Speaking Script (Plain English)

### 📌 Slide 1: Cover & Team Introduction
> [!QUOTE] What to say (25 seconds)
> *"Good morning respected examiners and mentor Prof. Megha Gupta. I am Harsh Kumar, leader of Group G. Together with my teammates Anamika, Sinthoiba, and Himesh, we are excited to present **DropOrCop**: an end-to-end Machine Learning platform that predicts sneaker secondary market prices and determines whether a drop is a profitable COP or a risky DROP."*

---

### 📌 Slide 2: Problem Background & Market Arbitrage
> [!QUOTE] What to say (40 seconds)
> *"To understand why we built this: limited sneakers like Adidas Yeezys and Nike Off-Whites retail for around $200. On secondary marketplaces like StockX, they can resell for $800—or unexpectedly crash below retail price.*
> 
> *Right now, buyers flip sneakers based on gut feeling. But prices depend heavily on shoe size, brand hype, and how many days have passed since drop day. Our goal was to eliminate the guesswork: delivering an accurate resale prediction and a clear **COP** (buy for profit) or **DROP** (skip to avoid loss) recommendation in under 50 milliseconds."*

---

### 📌 Slide 3: Three-Tier System Architecture
> [!QUOTE] What to say (25 seconds)
> *"Here is how our entire system connects. It has three decoupled tiers:*
> 1. *A luxury React web client built by **Himesh**.*
> 2. *A high-speed FastAPI backend built by **Sinthoiba**.*
> 3. *And our trained Machine Learning pipeline.*
> 
> *When a user picks a shoe on the web, FastAPI validates the data in memory, our model runs the prediction, and the frontend instantly renders an animated COP or DROP recommendation."*

---

### 📌 Slide 4: Data Cleaning & Feature Engineering (Your Core ML Part)
> [!QUOTE] What to say (45 seconds — Everyday English)
> *"This is my primary technical ownership in Phases 1 and 2. I started with 94,355 real sales from StockX.*
> 
> *First, I cleaned raw currency symbols and formatted dates so the dataset had zero errors or null values.*
> 
> *Next, I engineered our most important feature: **`days_since_release`**. Sneaker hype isn't permanent; prices are highest during drop week and gradually cool down over months.*
> 
> *Finally, because machine learning models only understand numbers, I used **One-Hot Encoding** to turn shoe names into binary indicators, and **StandardScaler** so shoe sizes like 9 or 10 don't distort dollar prices. Then I handed 18,871 untouched holdout records to Anamika for testing."*

---

### 📌 Slide 5: Model Selection & Training (Your Core ML Part)
> [!QUOTE] What to say (45 seconds — Everyday English)
> *"For Phase 3, I designed the machine learning model. Simple straight-line formulas don't work because sneaker hype spikes unpredictably. So I chose a **Random Forest Regressor**.*
> 
> *Think of it as 100 individual decision trees: each tree looks at the shoe from a slightly different angle, and we average all 100 votes together. This stops the model from overfitting.*
> 
> *Compared to Gradient Boosting, Random Forest trained 6 times faster—under 1 second—while delivering slightly higher accuracy.*
> 
> *I bundled the transformers and model into a single `.joblib` file so Sinthoiba could load it in one line of code.*
> 
> ***[Verbal Hand-off]:** Now I'll pass the floor to **Anamika**, who tested the model as our evaluation lead."*

---

### 📌 Slides 6, 7 & 8: Teammate Spotlight!
> [!NOTE] Teammates Take The Floor
> - **Slide 6 (Anamika Ghosh - Model Checking):** 18,871 test samples, $R^2 = 0.6525$, MAE = $\$88.69$, and $99.02\%$ COP/DROP directional accuracy.
> - **Slide 7 (Sinthoiba Kangjam - Backend API):** FastAPI microservice, Pydantic data validation, sub-45ms latency, and 7/7 unit tests passing.
> - **Slide 8 (Himesh Vaskar - Frontend UI/UX):** **Himesh takes full spotlight** presenting the Next.js luxury UI, brand selector chips, shoe size pills, and the animated COP/DROP badge!

---

### 📌 Slide 9: Live Demo & Verification
> [!QUOTE] What to say (Co-presenting with Himesh - 40 seconds)
> *[Himesh explains UI & Playwright testing, then Harsh steps in for the numbers]:*
> *"In a live scenario: a user selects a Yeezy 350 V2 Butter at retail $220, size 10.5, 30 days after release. In under 45 milliseconds, the model predicts a resale price of $268, yielding a **+$48 profit (22% margin)**. Because this exceeds the user's 15% threshold, Himesh's UI stamps an unmistakable emerald **COP** recommendation."*

---

### 📌 Slide 10: Team Roles & Audit Matrix
> [!QUOTE] What to say (30 seconds)
> *"As team leader, I am proud to report that every member of Group G took complete, verifiable ownership of their phase:*
> - *I managed the data pipeline and machine learning model.*
> - *Anamika led independent model verification and residual diagnostics.*
> - *Sinthoiba engineered the backend REST API and automated test suite.*
> - *And Himesh built our complete frontend user interface and design system.*
> 
> *All code commits and logs in our GitHub repository reflect this exact division of labor."*

---

### 📌 Slide 11: Conclusion & Q&A
> [!QUOTE] What to say (25 seconds)
> *"In conclusion, DropOrCop proves that machine learning can reliably quantify sneaker arbitrage and protect buyers from costly drops. For Version 2.0, we plan to connect live web scrapers to GOAT and eBay, and release a mobile app.*
> 
> *We would like to sincerely thank our faculty mentor Prof. Megha Gupta and the CSE department. The team is now open for your questions!"*

---

## 🎯 Top 5 Tough Viva Questions for Harsh (10-Second Answers)

> [!QUESTION] Q1: Why did you pick Random Forest over Linear Regression?
> **Answer:** *"Linear regression assumes sneaker prices grow steadily in a straight line. But sneaker prices have non-linear hype spikes—a collaboration colorway can trade for 4 times the price of a normal colorway. Random Forest uses 100 decision trees to capture these non-linear rules without overfitting."*

> [!QUESTION] Q2: What is `days_since_release` and why did you create it?
> **Answer:** *"It is the number of days between the shoe's official release and the resale transaction. It captures the 'hype decay curve'—prices are highest right after launch, drop after a few months, and sometimes rise years later as deadstock pairs become rare."*

> [!QUESTION] Q3: How did you prevent data leakage during training?
> **Answer:** *"I split the dataset strictly into 80% training and 20% testing before applying any scaling or encoding. The `StandardScaler` was fit ONLY on the training split, and then transformed the test split. Furthermore, all 18,871 holdout records were locked away and only evaluated independently by Anamika."*

> [!QUESTION] Q4: Why is your $R^2$ 0.6525 and not 0.95?
> **Answer:** *"Because human fashion and sneaker resale prices are heavily influenced by viral internet culture and unpredictable celebrity endorsements that no dataset can fully record. An $R^2$ of 65.25% with an MAE of $88 is very strong for secondary fashion, and more importantly, our directional COP/DROP accuracy is 99.02%."*

> [!QUESTION] Q5: How did your model hand off to Sinthoiba's backend and Himesh's frontend?
> **Answer:** *"I exported the entire Scikit-learn preprocessing and model pipeline as a single `best_model.joblib` file. Sinthoiba loaded this file on FastAPI server startup, so the API receives raw JSON from Himesh's frontend, validates it, passes it through my pipeline, and returns the result in under 45ms."*

---

## 📊 Key Numbers Cheat Sheet (Memorize Before Viva!)

| Metric / Parameter | Value | What It Represents in Plain English |
| :--- | :---: | :--- |
| **Total StockX Records** | **94,355** | Cleaned secondary transactions from StockX |
| **Training Set Size** | **75,484** | 80% split used to train Random Forest |
| **Holdout Test Set Size** | **18,871** | 20% untouched split evaluated by Anamika |
| **Random Forest Estimators** | **100** | Number of decision trees voting together |
| **Model Training Time** | **<0.95s** | 6.5x faster than Gradient Boosting (6.2s) |
| **Holdout $R^2$ Score** | **0.6525** | Explains 65.25% of price variance |
| **Mean Absolute Error (MAE)** | **$88.69** | Average dollar distance from actual resale price |
| **COP / DROP Directional Accuracy** | **99.02%** | Correct recommendation 99 times out of 100 |
| **Average Residual Bias** | **-$1.22** | Near-zero systematic over/under-pricing |
| **API Response Latency** | **<45ms** | Instantaneous user experience on Himesh's UI |
