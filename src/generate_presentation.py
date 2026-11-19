#!/usr/bin/env python3
"""
Generate DropOrCop End-Semester Defense Presentation Deck (.pptx)
Strictly adheres to SITM 9-Chapter Capstone Evaluation Guidelines.
16:9 Widescreen, Dark Luxury Aesthetic, High Contrast Typography.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # Blank slide layout

    # Color Palette: Luxury Sneaker Marketplace (Dark Slate & Emerald)
    BG_COLOR = RGBColor(15, 23, 42)        # Slate 900
    CARD_BG = RGBColor(30, 41, 59)         # Slate 800
    CARD_BORDER = RGBColor(51, 65, 85)     # Slate 700
    TEXT_LIGHT = RGBColor(248, 250, 252)   # Slate 50
    TEXT_MUTED = RGBColor(148, 163, 184)   # Slate 400
    ACCENT_GREEN = RGBColor(16, 185, 129)  # Emerald 500 (COP)
    ACCENT_RED = RGBColor(244, 63, 94)     # Rose 500 (DROP)
    ACCENT_GOLD = RGBColor(245, 158, 11)   # Amber 500
    ACCENT_BLUE = RGBColor(56, 189, 248)   # Sky 400

    def apply_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    def add_header(slide, chapter_tag, title_text, presenter_name=None):
        # Header Container
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.1))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        # Chapter Tag
        p_tag = tf.paragraphs[0]
        p_tag.text = chapter_tag.upper()
        p_tag.font.name = "Arial"
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = ACCENT_GOLD
        p_tag.space_after = Pt(2)

        # Title
        p_title = tf.add_paragraph()
        p_title.text = title_text
        p_title.font.name = "Arial"
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_LIGHT

        # Presenter Badge on Top Right
        if presenter_name:
            badge_box = slide.shapes.add_shape(
                MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.2), Inches(0.4), Inches(3.333), Inches(0.5)
            )
            badge_box.fill.solid()
            badge_box.fill.fore_color.rgb = CARD_BG
            badge_box.line.color.rgb = CARD_BORDER
            badge_box.line.width = Pt(1)
            btf = badge_box.text_frame
            btf.margin_top = Inches(0.08)
            bp = btf.paragraphs[0]
            bp.alignment = PP_ALIGN.CENTER
            bp.text = f"Presenter: {presenter_name}"
            bp.font.name = "Arial"
            bp.font.size = Pt(10)
            bp.font.bold = True
            bp.font.color.rgb = ACCENT_BLUE

    def add_card(slide, left, top, width, height, title, items, highlight_color=None):
        # Card Background Box
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = highlight_color if highlight_color else CARD_BORDER
        card.line.width = Pt(1.5 if highlight_color else 1)

        # Content Box inside Card
        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.18), width - Inches(0.4), height - Inches(0.36))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        if title:
            pt = tf.paragraphs[0]
            pt.text = title
            pt.font.name = "Arial"
            pt.font.size = Pt(14)
            pt.font.bold = True
            pt.font.color.rgb = highlight_color if highlight_color else TEXT_LIGHT
            pt.space_after = Pt(8)

        first = True if not title else False
        for item in items:
            p = tf.paragraphs[0] if first else tf.add_paragraph()
            first = False
            p.text = f"•  {item}"
            p.font.name = "Arial"
            p.font.size = Pt(11)
            p.font.color.rgb = TEXT_LIGHT
            p.space_after = Pt(6)

        return card

    # =========================================================================
    # SLIDE 1: Title & Institutional Front-Matter
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    apply_background(s1)

    # Decorative top bar
    top_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.7), Inches(11.733), Inches(0.08))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = ACCENT_GREEN
    top_bar.line.fill.background()

    # Title & Subtitle Frame
    title_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.1), Inches(11.733), Inches(2.2))
    tf1 = title_box.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "ACADEMIC DELIVERABLE 04 / FINAL CAPSTONE DEFENSE"
    p0.font.name = "Arial"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_GOLD
    p0.space_after = Pt(8)

    p1 = tf1.add_paragraph()
    p1.text = "DROPORCOP: Sneaker Resale Profit Predictor"
    p1.font.name = "Arial"
    p1.font.size = Pt(32)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_LIGHT
    p1.space_after = Pt(6)

    p2 = tf1.add_paragraph()
    p2.text = "Real-Time Machine Learning Secondary Market Valuation & COP / DROP Arbitrage Engine"
    p2.font.name = "Arial"
    p2.font.size = Pt(15)
    p2.font.color.rgb = TEXT_MUTED

    # Team Members Card
    add_card(
        s1, Inches(0.8), Inches(3.6), Inches(6.8), Inches(3.2),
        "PROJECT TEAM (GROUP G)",
        [
            "Harsh Kumar (2026-CSE-031) — Team Leader & ML Lead (Phases 1–3)",
            "Anamika Ghosh (2026-CSE-032) — Model Checking Lead (Phase 4)",
            "Sinthoiba Kangjam (2026-CSE-034) — Backend & Integration Lead (Phase 5)",
            "Himesh Vaskar (2026-CSE-035) — Frontend UI/UX Lead (Phase 6)"
        ],
        highlight_color=ACCENT_BLUE
    )

    # Department & Mentor Card
    add_card(
        s1, Inches(7.9), Inches(3.6), Inches(4.633), Inches(3.2),
        "INSTITUTIONAL METADATA",
        [
            "Institution: Scholars Institute of Technology & Management",
            "Department: Computer Science & Engineering",
            "Program: B.Tech CSE End-Semester Sprint (Nov 2026)",
            "Faculty Mentor: Prof. Megha Gupta (Assistant Professor, CSE)",
            "Defense Date: 19 November 2026"
        ],
        highlight_color=ACCENT_GOLD
    )

    s1.notes_slide.notes_text_frame.text = (
        "SPEAKER SCRIPT (Harsh Kumar - 30 seconds):\n"
        "Good morning respected examiners and mentor Prof. Megha Gupta. I am Harsh Kumar, leader of Group G. "
        "Together with my teammates Anamika, Sinthoiba, and Himesh, we are presenting DropOrCop—an end-to-end "
        "machine learning platform that predicts sneaker resale prices and determines whether a release is a profitable COP or a risky DROP."
    )

    # =========================================================================
    # SLIDE 2: Chapter 1: Problem Definition & Market Opportunity
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    apply_background(s2)
    add_header(s2, "Chapter 1: Introduction & Problem Definition", "The Sneaker Resale Arbitrage Gap & Motivation", "Harsh Kumar")

    add_card(
        s2, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "1.1 Market Asymmetry",
        [
            "Limited-edition sneakers (Off-White, Yeezy) retail at $160–$250 USD.",
            "Secondary markets (StockX, GOAT) see massive 100%–400% markups ($800+).",
            "Buyers risk capital on overhyped sneakers that quickly crash below retail.",
            "High volatility makes casual flipping risky without statistical pricing."
        ],
        highlight_color=ACCENT_RED
    )

    add_card(
        s2, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "1.2 Why Heuristics Fail",
        [
            "Manual 'gut-feel' flipping ignores non-linear release fatigue dynamics.",
            "Shoe size premiums vary widely (e.g., US 9 vs US 14 have vastly different margins).",
            "Brand collaboration power changes over time (Off-White vs Yeezy decay rates).",
            "Traditional rules cannot process multi-dimensional interaction effects."
        ],
        highlight_color=ACCENT_GOLD
    )

    add_card(
        s2, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "1.3 Objectives & KPIs",
        [
            "Target Personas: Undergraduates, sneaker collectors, and secondary market flippers.",
            "Predictive KPI: Achieve Mean Absolute Error (MAE) under $100 USD.",
            "Directional KPI: >98% COP/DROP classification accuracy on holdout test data.",
            "Operational KPI: Deliver sub-50ms inference via production REST API."
        ],
        highlight_color=ACCENT_GREEN
    )

    s2.notes_slide.notes_text_frame.text = (
        "SPEAKER SCRIPT (Harsh Kumar - 45 seconds):\n"
        "To understand why we built DropOrCop: limited sneakers like Yeezys and Off-White Nikes retail around $200, "
        "but on secondary platforms like StockX they can resell for $800, or unexpectedly crash below retail.\n\n"
        "Currently, college students and sneakerheads guess based on gut feeling. But prices depend heavily on shoe size, "
        "brand hype, and how many days have passed since release. Our goal was to replace guesswork with data: "
        "delivering an accurate resale prediction and a clear COP (buy) or DROP (skip) recommendation in under 50 milliseconds."
    )

    # =========================================================================
    # SLIDE 3: Chapter 2: System Architecture & Requirements
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    apply_background(s3)
    add_header(s3, "Chapter 2: System Architecture & Specifications", "End-to-End Three-Tier System Architecture", "Harsh & Sinthoiba")

    add_card(
        s3, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0),
        "2.1 System Architecture Flow",
        [
            "[Tier 1: Web Client (React 19 / Next.js 16)]",
            "  • Luxury dark aesthetic designed by Himesh Vaskar.",
            "  • Real-time parameter sliders, brand chips, and instant badge render.",
            "          ⬇ Async JSON REST Requests (HTTP POST /predict)",
            "[Tier 2: Backend API (FastAPI / Uvicorn Microservice)]",
            "  • Engineered by Sinthoiba Kangjam with sub-50ms latency.",
            "  • Pydantic defensive validation; CORS middleware enabled.",
            "          ⬇ In-Memory Execution (.joblib)",
            "[Tier 3: Machine Learning Engine (Scikit-Learn Pipeline)]",
            "  • One-Hot Encoding + StandardScaler + RandomForestRegressor.",
            "  • Evaluated and certified by Anamika Ghosh."
        ],
        highlight_color=ACCENT_BLUE
    )

    add_card(
        s3, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0),
        "2.2 SRS & REST Contract (`POST /predict`)",
        [
            "Functional Requirements (FR):",
            "  • FR-01: User selects brand, sneaker model, size, retail price, release age.",
            "  • FR-02: Automated calculation of expected resale, profit $, and margin %.",
            "  • FR-03: Dynamic COP/DROP classification based on user's target threshold.",
            "Non-Functional Requirements (NFR):",
            "  • NFR-01: Sub-50ms response time under asynchronous Uvicorn server.",
            "  • NFR-02: Defensive HTTP 422 error handlers for negative numbers or invalid sizes.",
            "REST Payload Contract:",
            "  • Request: {brand, sneaker_name, retail_price, shoe_size, days_since_release}",
            "  • Response: {predicted_resale_price: 268.4, net_profit: 48.4, verdict: 'COP'}"
        ],
        highlight_color=ACCENT_GREEN
    )

    s3.notes_slide.notes_text_frame.text = (
        "SPEAKER SCRIPT (Harsh Kumar - 30 seconds):\n"
        "Here is our complete system architecture. It has three decoupled tiers: "
        "A luxury React web client built by Himesh, a FastAPI backend service built by Sinthoiba, "
        "and our trained machine learning pipeline. When a user inputs sneaker details, the request is validated "
        "in memory, processed by the model, and returned in less than 50 milliseconds."
    )

    # =========================================================================
    # SLIDE 4: Chapter 3: Dataset Engineering & EDA Pipeline (Harsh's Part)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    apply_background(s4)
    add_header(s4, "Chapter 3: Dataset Engineering & Preprocessing", "StockX Ingestion, Cleaning & Feature Creation", "Harsh Kumar (ML Lead)")

    add_card(
        s4, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "3.1 StockX Data Cleaning",
        [
            "Raw Corpus: 94,355 secondary transactions from StockX marketplace.",
            "Covers Nike x Off-White and Adidas Yeezy releases across global sales.",
            "Cleaned raw currency strings ('$1,200.00' ➔ float 1200.0).",
            "Standardized shoe sizes to US Men's numeric scale (4.0 to 15.0).",
            "Zero nulls or missing values in final clean dataset."
        ],
        highlight_color=ACCENT_BLUE
    )

    add_card(
        s4, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "3.2 Feature Engineering",
        [
            "Core Engineered Feature: `days_since_release`",
            "Formula: `Order Date - Release Date` (in elapsed days).",
            "Captures the 'hype decay curve'—prices spike on drop week and stabilize over months.",
            "Target Feature Formulation:",
            "  • Resale Price ($ USD) for continuous regression.",
            "  • Profit Margin %: ((Resale - Retail) / Retail) * 100."
        ],
        highlight_color=ACCENT_GOLD
    )

    add_card(
        s4, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "3.3 Encoding & Transformation",
        [
            "Categorical Encoding:",
            "  • One-Hot Encoding for sneaker models and brand tiers.",
            "  • Handled high cardinality without data leakage.",
            "Numerical Standardization:",
            "  • StandardScaler applied to numerical features so shoe size doesn't distort dollar pricing.",
            "Train/Test Partition: Strict 80/20 train-test split (18,871 holdout test records)."
        ],
        highlight_color=ACCENT_GREEN
    )

    s4.notes_slide.notes_text_frame.text = (
        "SPEAKER SCRIPT (Harsh Kumar - 45 seconds - Plain English):\n"
        "This is my primary technical ownership in Phases 1 and 2. I started with 94,355 real sales from StockX. "
        "First, I cleaned the currency symbols and dates so the data had zero errors.\n\n"
        "Next, I engineered our most important feature: 'days since release'. Sneaker prices don't stay constant; "
        "they are hottest right when they drop, and cool down over time.\n\n"
        "Finally, because computers only understand numbers, I used One-Hot Encoding to turn shoe names into numerical flags, "
        "and scaled the numbers so shoe sizes wouldn't distort the dollar amounts. Then I handed 18,871 untouched test records to Anamika."
    )

    # =========================================================================
    # SLIDE 5: Chapter 4: ML Model Selection & Training (Harsh's Part)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    apply_background(s5)
    add_header(s5, "Chapter 4: Model Design & Training Protocol", "Random Forest Regressor & Pipeline Export", "Harsh Kumar (ML Lead)")

    add_card(
        s5, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "4.1 Why Random Forest?",
        [
            "Linear models assume prices grow in a straight line, which fails on viral sneaker drops.",
            "Sneakers exhibit non-linear hype thresholding (e.g., Chicago colorways trade 3x higher).",
            "Random Forest uses an ensemble of 100 decision trees voting together.",
            "Bagging (Bootstrap Aggregating) prevents overfitting and stabilizes price variances."
        ],
        highlight_color=ACCENT_GOLD
    )

    add_card(
        s5, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "4.2 Baseline vs Champion",
        [
            "Baseline: Gradient Boosting Regressor",
            "  • Train Time: ~6.2 seconds",
            "  • R² Score: 0.6510 | MAE: $89.12",
            "Champion: Random Forest Regressor",
            "  • Train Time: <0.95 seconds (6.5x faster!)",
            "  • R² Score: 0.6525 | MAE: $88.69",
            "Random Forest delivers superior accuracy with dramatically faster training and instant retraining capability."
        ],
        highlight_color=ACCENT_GREEN
    )

    add_card(
        s5, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "4.3 Pipeline Serialization",
        [
            "Full Scikit-Learn Pipeline encapsulation:",
            "  [ColumnTransformer (OHE + Scaler)] + [RandomForestRegressor]",
            "Trained on 75,484 training rows.",
            "Exported using `joblib` into `models/best_model.joblib` (8.8 MB).",
            "Enables atomic deployment—backend loads both preprocessors and model in one line.",
            "Ready for handoff to Anamika for Phase 4 verification."
        ],
        highlight_color=ACCENT_BLUE
    )

    s5.notes_slide.notes_text_frame.text = (
        "SPEAKER SCRIPT (Harsh Kumar - 45 seconds - Plain English):\n"
        "In Phase 3, I designed the machine learning model. Simple straight-line formulas don't work for sneakers "
        "because prices spike unpredictably. So I chose a Random Forest Regressor.\n\n"
        "You can think of it as 100 different decision trees voting on the price. Each tree looks at the shoe slightly differently, "
        "and we average their answers. When compared to Gradient Boosting, Random Forest trained 6 times faster—under 1 second—"
        "while giving slightly better accuracy.\n\n"
        "I bundled the preprocessors and the model into a single .joblib file for Sinthoiba to load into FastAPI. "
        "Now, I'll pass the presentation to Anamika to share how she evaluated the model."
    )

    # =========================================================================
    # SLIDE 6: Chapter 5: Results, Performance Analysis & Residuals
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    apply_background(s6)
    add_header(s6, "Chapter 5: Results & Comparative Discussion", "Holdout Verification & Residual Diagnostics", "Anamika Ghosh (Eval Lead)")

    # Left Column: Metric Cards
    m1 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(2.6), Inches(1.5))
    m1.fill.solid()
    m1.fill.fore_color.rgb = CARD_BG
    m1.line.color.rgb = ACCENT_BLUE
    m1_tf = m1.text_frame
    m1_tf.margin_top = Inches(0.15)
    p = m1_tf.paragraphs[0]
    p.text = "18,871"
    p.font.name = "Arial"
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    p.alignment = PP_ALIGN.CENTER
    p_sub = m1_tf.add_paragraph()
    p_sub.text = "Holdout Test Records"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = TEXT_MUTED
    p_sub.alignment = PP_ALIGN.CENTER

    m2 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.6), Inches(1.8), Inches(2.6), Inches(1.5))
    m2.fill.solid()
    m2.fill.fore_color.rgb = CARD_BG
    m2.line.color.rgb = ACCENT_GREEN
    m2_tf = m2.text_frame
    m2_tf.margin_top = Inches(0.15)
    p = m2_tf.paragraphs[0]
    p.text = "0.6525"
    p.font.name = "Arial"
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN
    p.alignment = PP_ALIGN.CENTER
    p_sub = m2_tf.add_paragraph()
    p_sub.text = "Test R² Score (65.25%)"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = TEXT_MUTED
    p_sub.alignment = PP_ALIGN.CENTER

    m3 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(3.5), Inches(2.6), Inches(1.5))
    m3.fill.solid()
    m3.fill.fore_color.rgb = CARD_BG
    m3.line.color.rgb = ACCENT_GOLD
    m3_tf = m3.text_frame
    m3_tf.margin_top = Inches(0.15)
    p = m3_tf.paragraphs[0]
    p.text = "$88.69"
    p.font.name = "Arial"
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GOLD
    p.alignment = PP_ALIGN.CENTER
    p_sub = m3_tf.add_paragraph()
    p_sub.text = "Mean Absolute Error (MAE)"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = TEXT_MUTED
    p_sub.alignment = PP_ALIGN.CENTER

    m4 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.6), Inches(3.5), Inches(2.6), Inches(1.5))
    m4.fill.solid()
    m4.fill.fore_color.rgb = CARD_BG
    m4.line.color.rgb = ACCENT_GREEN
    m4_tf = m4.text_frame
    m4_tf.margin_top = Inches(0.15)
    p = m4_tf.paragraphs[0]
    p.text = "99.02%"
    p.font.name = "Arial"
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN
    p.alignment = PP_ALIGN.CENTER
    p_sub = m4_tf.add_paragraph()
    p_sub.text = "COP/DROP Directional Accuracy"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = TEXT_MUTED
    p_sub.alignment = PP_ALIGN.CENTER

    # Additional stats box
    add_card(
        s6, Inches(0.8), Inches(5.2), Inches(5.4), Inches(1.6),
        "Residual Diagnostics",
        [
            "Residual Mean (Bias): -$1.22 USD (statistically near-zero bias).",
            "Root Mean Squared Error (RMSE): $143.71 (penalizes viral collector outliers).",
            "Mean Absolute Percentage Error (MAPE): 20.23% (strong relative accuracy)."
        ],
        highlight_color=CARD_BORDER
    )

    # Right Column: Actual vs Predicted Image if available, else card
    img_path = "reports/figures/01_actual_vs_predicted.png"
    if os.path.exists(img_path):
        s6.shapes.add_picture(img_path, Inches(6.5), Inches(1.8), width=Inches(6.0))
    else:
        add_card(
            s6, Inches(6.5), Inches(1.8), Inches(6.0), Inches(5.0),
            "Holdout Findings Summary",
            [
                "Evaluated 18,871 completely unseen transactions.",
                "Parity plot closely hugs the y = x identity line.",
                "Near-zero systematic error ensures buyers are never misled.",
                "Directional COP/DROP accuracy of 99.02% gives collectors high buying confidence."
            ]
        )

    s6.notes_slide.notes_text_frame.text = (
        "SPEAKER SCRIPT (Anamika Ghosh - 45 seconds):\n"
        "Thank you Harsh. In Phase 4, I acted as the quality control inspector. I tested Harsh's model against 18,871 sales "
        "the model had never seen before.\n\n"
        "Our model achieved an R-squared of 0.6525, an MAE of $88.69, and an extraordinary 99.02% COP/DROP directional accuracy. "
        "Crucially, our average residual error is only negative $1.22, proving that the model does not systematically "
        "overprice or underprice sneakers. Now I'll pass the floor to Sinthoiba to discuss our backend API."
    )

    # =========================================================================
    # SLIDE 7: Chapter 6: Software Implementation - Backend REST API
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    apply_background(s7)
    add_header(s7, "Chapter 6: Software Implementation - Backend API", "FastAPI Asynchronous Microservice & Architecture", "Sinthoiba Kangjam (Backend)")

    add_card(
        s7, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "6.1 REST API Endpoints",
        [
            "`GET /health`",
            "  • Liveness probe, memory status & model loaded check.",
            "`GET /brands`",
            "  • Returns supported brands & shoe catalog metadata.",
            "`POST /predict`",
            "  • Core inference endpoint; computes resale price, net profit, and COP/DROP verdict.",
            "`GET /history`",
            "  • Live SQLite feed of recent user valuations."
        ],
        highlight_color=ACCENT_BLUE
    )

    add_card(
        s7, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "6.2 Defensive Pydantic Validation",
        [
            "Strict Input Validation Guards:",
            "  • `retail_price > 0`: rejects negative or zero prices.",
            "  • `shoe_size`: validates against US Men's half sizes (4.0–15.0).",
            "  • `days_since_release >= 0`: guards chronological validity.",
            "  • `margin_threshold`: bounds target profit (5% to 50%).",
            "Error Handling: Returns structured HTTP 422 Unprocessable Entity payloads."
        ],
        highlight_color=ACCENT_GOLD
    )

    add_card(
        s7, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "6.3 Performance & Testing",
        [
            "Sub-45ms Average Latency:",
            "  • In-memory model caching with zero disk read overhead per request.",
            "Asynchronous Uvicorn Server:",
            "  • Handles concurrent evaluation requests without blocking.",
            "Test Suite Matrix:",
            "  • 7 automated unit tests (`tests/test_api.py`) passing with 100% success rate.",
            "CORS Configured for Next.js web client."
        ],
        highlight_color=ACCENT_GREEN
    )

    s7.notes_slide.notes_text_frame.text = (
        "SPEAKER SCRIPT (Sinthoiba Kangjam - 45 seconds):\n"
        "Thank you Anamika. In Phase 5, I built the high-speed backend microservice using FastAPI and Uvicorn. "
        "I loaded the trained Random Forest model into memory on server startup so predictions take under 45 milliseconds.\n\n"
        "Using Pydantic schemas, I implemented strict defensive validation—if a user submits a negative price or invalid shoe size, "
        "the API immediately returns a clean 422 error without crashing. All 7 unit tests pass with 100% success. "
        "Now, I'll hand over to Himesh, who built our luxury frontend web application."
    )

    # =========================================================================
    # SLIDE 8: Chapter 6: Frontend UI/UX Architecture (Himesh's Spotlight!)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    apply_background(s8)
    add_header(s8, "Chapter 6: Frontend UI/UX Architecture & Experience", "Luxury Editorial Marketplace Interface", "Himesh Vaskar (Frontend Lead)")

    # Left Column: Features Card
    add_card(
        s8, Inches(0.8), Inches(1.8), Inches(5.4), Inches(5.0),
        "6.4 Next.js 16 Luxury Interface",
        [
            "Modern Tech Stack: Next.js 16 (App Router), React 19, Tailwind CSS v4, Motion.",
            "Editorial Dark Theme: Slate dark palette inspired by StockX and Linear.",
            "Interactive Input Controls:",
            "  • Brand selector chips (Yeezy, Off-White, Nike, Jordan).",
            "  • US half-size selector pills (4.0 to 15.0).",
            "  • Days since release slider with quick preset chips (0d, 30d, 90d, 180d, 365d).",
            "Real-Time Output Badging:",
            "  • Animated COP (Emerald) / DROP (Rose) stamp.",
            "  • Net profit $ counter and margin % gauge.",
            "Recent Valuations History Drawer with 1-click retest."
        ],
        highlight_color=ACCENT_BLUE
    )

    # Right Column: UI Screenshot
    ui_img_path = "reports/visual/desktop_viewport_1440x900.png"
    if not os.path.exists(ui_img_path):
        ui_img_path = "reports/visual/valuation_cockpit_minimal.png"

    if os.path.exists(ui_img_path):
        s8.shapes.add_picture(ui_img_path, Inches(6.5), Inches(1.8), width=Inches(6.0))
    else:
        add_card(
            s8, Inches(6.5), Inches(1.8), Inches(6.0), Inches(5.0),
            "UI Design Highlights",
            [
                "Zero generic templates; custom dark luxury aesthetic.",
                "Smooth Framer Motion entrance and verdict stamp animations.",
                "Live health check radar indicator connected to /health.",
                "Passed dual-pass accessibility and mobile responsiveness QA."
            ]
        )

    s8.notes_slide.notes_text_frame.text = (
        "SPEAKER SCRIPT (Himesh Vaskar - 45 seconds):\n"
        "Thank you Sinthoiba. In Phase 6, I built our frontend user interface using Next.js 16, React 19, and Tailwind CSS. "
        "I wanted to steer clear of generic AI templates and deliver a dark, premium aesthetic that sneaker collectors actually enjoy using.\n\n"
        "Users can select brands with one click, choose their shoe size, and use quick preset pills to see how release age impacts price. "
        "When you hit predict, the interface smoothly animates the estimated resale price, calculates net profit, and stamps a glowing "
        "COP or DROP recommendation. I also added a recent predictions feed so users can compare multiple pairs easily. "
        "Now Harsh and I will demonstrate the live system flow."
    )

    # =========================================================================
    # SLIDE 9: Chapter 7: System Verification & Live Software Demo
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    apply_background(s9)
    add_header(s9, "Chapter 7: Verification & Live System Walkthrough", "Automated QA Verification & Live User Flow", "Himesh & Harsh")

    add_card(
        s9, Inches(0.8), Inches(1.8), Inches(5.4), Inches(5.0),
        "7.1 Automated QA & Edge Case Matrix",
        [
            "Automated Backend Unit Tests (7/7 Passing):",
            "  • `test_health`: verifies server status and model loaded.",
            "  • `test_predict_valid_yeezy`: verifies standard prediction.",
            "  • `test_predict_release_day`: tests boundary condition (0 days).",
            "  • `test_predict_edge_shoe_sizes`: tests extreme sizes (4.0 & 15.0).",
            "  • `test_predict_negative_price`: confirms HTTP 422 guard.",
            "Adversarial Playwright UI Testing:",
            "  • Tested desktop (1440x900) & mobile (375x812) viewports.",
            "  • 0 console errors, 0 text clipping, 100% responsive."
        ],
        highlight_color=ACCENT_GREEN
    )

    add_card(
        s9, Inches(6.5), Inches(1.8), Inches(6.0), Inches(5.0),
        "7.2 Live Demo Walkthrough Scenario",
        [
            "Demonstration Scenario: Yeezy Boost 350 V2 'Butter'",
            "Step 1: User Inputs Parameters",
            "  • Brand: Adidas Yeezy | Sneaker: Yeezy Boost 350 V2 Butter",
            "  • Retail Price: $220.00 | Shoe Size: US Men 10.5 | Age: 30 days",
            "  • Target Profit Threshold: 15% margin",
            "Step 2: Microservice Processing (<45ms)",
            "  • API validates payload ➔ Pipeline scales & encodes ➔ Random Forest infers.",
            "Step 3: Instant Interactive Verdict",
            "  • Predicted Resale Price: $268.40 USD",
            "  • Expected Net Profit: +$48.40 USD (+22.0% Margin)",
            "  • Live Recommendation: [ COP (BUY) ] with emerald glow badge."
        ],
        highlight_color=ACCENT_BLUE
    )

    s9.notes_slide.notes_text_frame.text = (
        "SPEAKER SCRIPT (Himesh Vaskar & Harsh Kumar - 45 seconds):\n"
        "[Himesh]: We thoroughly stress-tested DropOrCop before deployment. Sinthoiba's backend passed all 7 automated unit tests, "
        "and I verified the UI across both desktop and mobile viewports with Playwright to ensure zero layout bugs.\n\n"
        "[Harsh]: In a live scenario, a user enters a pair like the Yeezy 350 Butter at retail $220. In under 45 milliseconds, "
        "the model predicts a resale price of $268, yielding a $48 net profit (22% margin). Because this beats the user's 15% threshold, "
        "the system immediately delivers an unmistakable emerald COP badge. Now let's review our team work division."
    )

    # =========================================================================
    # SLIDE 10: Chapter 8: Team Contribution & Audit Matrix
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    apply_background(s10)
    add_header(s10, "Chapter 8: Team Contribution & Audit Matrix", "Official Workload Distribution (Group G)", "Harsh Kumar (Team Leader)")

    w = Inches(2.7)
    gap = Inches(0.24)
    start_left = Inches(0.8)

    # Member 1: Harsh
    add_card(
        s10, start_left, Inches(1.8), w, Inches(5.0),
        "Harsh Kumar\n(2026-CSE-031)",
        [
            "Role: ML Lead & Leader",
            "Ownership: Phases 1–3",
            "• StockX 94k cleaning",
            "• days_since_release",
            "• OHE & Scaler pipeline",
            "• Random Forest training",
            "• Model serialization",
            "• Coordination & Deck"
        ],
        highlight_color=ACCENT_GOLD
    )

    # Member 2: Anamika
    add_card(
        s10, start_left + (w + gap), Inches(1.8), w, Inches(5.0),
        "Anamika Ghosh\n(2026-CSE-032)",
        [
            "Role: Model Checking",
            "Ownership: Phase 4",
            "• 18,871 holdout eval",
            "• Metric calculation (R², MAE, RMSE, MAPE)",
            "• Residual distribution",
            "• Bias verification (-$1.22)",
            "• Directional accuracy",
            "• Phase 4 tech report"
        ],
        highlight_color=ACCENT_BLUE
    )

    # Member 3: Sinthoiba
    add_card(
        s10, start_left + 2 * (w + gap), Inches(1.8), w, Inches(5.0),
        "Sinthoiba Kangjam\n(2026-CSE-034)",
        [
            "Role: Backend Lead",
            "Ownership: Phase 5",
            "• FastAPI microservice",
            "• Pydantic validations",
            "• /predict, /health, /brands",
            "• Sub-50ms latency",
            "• CORS middleware",
            "• 7/7 unit tests suite"
        ],
        highlight_color=ACCENT_GREEN
    )

    # Member 4: Himesh
    add_card(
        s10, start_left + 3 * (w + gap), Inches(1.8), w, Inches(5.0),
        "Himesh Vaskar\n(2026-CSE-035)",
        [
            "Role: Frontend UI Lead",
            "Ownership: Phase 6",
            "• Next.js 16 + React 19",
            "• Dark luxury aesthetic",
            "• Brand & size chips",
            "• Days preset sliders",
            "• Animated COP stamp",
            "• History feed widget"
        ],
        highlight_color=ACCENT_RED
    )

    s10.notes_slide.notes_text_frame.text = (
        "SPEAKER SCRIPT (Harsh Kumar - 30 seconds):\n"
        "As team leader, I am proud to report that every member of Group G took complete, verifiable ownership of their phase. "
        "I managed the data pipeline and machine learning model. Anamika led independent validation and error checking. "
        "Sinthoiba built the backend REST API and test suite, and Himesh engineered our complete frontend user interface. "
        "Our Git commit history reflects this clear division of labor."
    )

    # =========================================================================
    # SLIDE 11: Chapter 9: Conclusion, Roadmap & Viva Voce Q&A
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    apply_background(s11)
    add_header(s11, "Chapter 9: Conclusion & Viva Voce Q&A", "Key Learnings, Version 2.0 Roadmap & Open Defense", "Entire Team")

    add_card(
        s11, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "9.1 Key Achievements",
        [
            "Production-ready machine learning platform solving secondary sneaker resale arbitrage.",
            "99.02% COP/DROP directional accuracy across 18,871 holdout test transactions.",
            "Sub-45ms real-time API latency delivering immediate actionable buying advice.",
            "Fully decoupled architecture with 100% test pass rate across backend and frontend."
        ],
        highlight_color=ACCENT_GREEN
    )

    add_card(
        s11, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "9.2 Version 2.0 Roadmap",
        [
            "Multi-Marketplace Live Scraping: Expand from static StockX corpus to live GOAT and eBay APIs.",
            "Native Mobile Application: React Native build for iOS and Android on-the-go flipping.",
            "Collector Sentiment Analysis: Incorporate Reddit and Twitter buzz into model feature set.",
            "Automated Model Retraining: Scheduled cron jobs to track shifting post-drop market hype."
        ],
        highlight_color=ACCENT_BLUE
    )

    add_card(
        s11, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0),
        "Viva Voce Q&A",
        [
            "Thank you to our Project Mentor Prof. Megha Gupta and Department of CSE.",
            "GitHub Repository: Harshified118/End-sem",
            "Deliverables Completed: PRD, Clean Pipeline, FastAPI Backend, Next.js UI, QA Suite.",
            "The Group G team is now ready for your questions!"
        ],
        highlight_color=ACCENT_GOLD
    )

    s11.notes_slide.notes_text_frame.text = (
        "SPEAKER SCRIPT (Harsh Kumar - 30 seconds):\n"
        "In conclusion, DropOrCop demonstrates that machine learning can reliably quantify sneaker arbitrage and protect buyers from costly drops. "
        "For Version 2.0, we plan to connect live scrapers for real-time market updates and release a mobile app.\n\n"
        "We want to sincerely thank our faculty mentor Prof. Megha Gupta and the examiners. "
        "Our entire team—Harsh, Anamika, Sinthoiba, and Himesh—is now open for your questions!"
    )

    # Save presentation
    output_path = "DropOrCop_Defense_Presentation.pptx"
    prs.save(output_path)
    print(f"Successfully generated {output_path} with {len(prs.slides)} slides.")

if __name__ == "__main__":
    create_deck()
