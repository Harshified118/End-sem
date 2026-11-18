# DropOrCop: Phase 5 Presentation & Viva Guide
**Author / Presenter:** Sinthoiba Kangjam  
**Role:** Backend & Integration Lead (Group G, Roll No. 34)  
**Academic Context:** Department of Computer Science & Engineering | B.Tech CSE End-Semester Project (Nov 2026)  
**Faculty Mentor:** Megha Gupta  

---

## 1. How Phase 5 Works (In Plain English)

Think of our system like a restaurant:
* **Harsh (ML Lead):** Trained the "secret recipe" (the machine learning model) that can estimate sneaker resale prices.
* **Sinthoiba (Backend Lead - Phase 5):** Built the **waiter and kitchen system (FastAPI)**. When a customer (or the frontend website) asks for a price prediction, my API takes the inputs, verifies that they make sense, hands them to the model, calculates the profit, determines whether it is a **COP** or **DROP**, and serves the clean result back in less than 50 milliseconds.
* **Himesh (Frontend Lead):** Builds the webpage menu and buttons that users see on screen.

---

## 2. Technologies Used & Why

| Technology | What it is | Why Sinthoiba used it |
| :--- | :--- | :--- |
| **FastAPI** | Modern Python Web Framework | Extremely fast, lightweight, and automatically generates interactive documentation (`/docs`). |
| **Uvicorn** | ASGI Web Server | The server that hosts and runs the FastAPI app on `localhost:8000`. |
| **Joblib** | Model Serializer | Loads the trained Random Forest model (`models/best_model.joblib`) into computer memory on startup. |
| **Pydantic** | Data Validation | Guards the API: verifies incoming prices and shoe sizes are positive numbers and valid types before touching the model. |
| **Pandas** | Data Processing | Formats incoming JSON into a 1-row table that the Scikit-learn pipeline expects. |
| **CORS Middleware** | Browser Connectivity | Allows Himesh's frontend webpage to send requests to the backend without being blocked by browser security. |
| **Unittest / TestClient** | Automated Testing | Verified that all 7 endpoints and edge cases pass with 100% success. |

---

## 3. End-to-End Data Flow

```
[User on Frontend Form]
         │
         │  (Sends: Brand, Retail Price, Shoe Size, Days Since Release)
         ▼
[FastAPI: POST /predict]
         │
         ├──► 1. Pydantic Schema Validation (Checks positive numbers, valid types)
         │
         ├──► 2. Scikit-learn Pipeline Inference (Predicts secondary market resale price)
         │
         ├──► 3. Business Logic Calculation:
         │         - Estimated Profit = Resale Price - Retail Price
         │         - Profit Margin % = (Profit / Retail Price) * 100
         │         - Verdict = "COP" if margin >= 15% else "DROP"
         ▼
[JSON Response returned to Frontend in < 50ms]
```

---

## 4. Word-for-Word Presentation Script

*(Practice this out loud. It takes approximately 2 to 3 minutes to deliver smoothly.)*

---

### **Slide: Phase 5 – Backend API & System Integration**

> *"Good morning / afternoon everyone and respected teachers. My name is **Sinthoiba Kangjam**, and I am the **Backend and Integration Lead** for Group G.*
>
> *Once Harsh finished data cleaning and trained our Random Forest regression model, my responsibility in **Phase 5** was to take that static model artifact and transform it into an active, real-time web service that our application can use.*
>
> *To achieve this, I developed a high-performance REST API using **FastAPI** and **Uvicorn**.*
>
> *Here is how my backend pipeline functions:*
>
> 1. *First, I implemented model lifecycle management using **Joblib**. The trained model is loaded into memory when the server starts up, meaning every incoming prediction request is processed in real time with an inference latency of under **1 millisecond**.*
>
> 2. *Second, for data integrity, I used **Pydantic schemas**. If someone inputs an invalid shoe size, a negative price, or an unsupported brand, the API catches it immediately with descriptive error responses rather than crashing the system.*
>
> 3. *Third, on the prediction endpoint (`POST /predict`), the API accepts the sneaker brand, retail price, size, and release age. It formats this data into a Pandas DataFrame, runs inference through our trained pipeline, and calculates the expected profit and profit margin percentage.*
>
> 4. *Based on our PRD logic, if the profit margin is 15% or higher, the API assigns a **COP** recommendation badge; otherwise, it assigns a **DROP** verdict.*
>
> 5. *To make the service production-ready, I also created a `/health` endpoint to verify model connectivity, a `/brands` endpoint to deliver supported brands to the frontend, and enabled **CORS middleware** so our UI can communicate with the backend smoothly.*
>
> *Finally, I wrote an automated test suite containing **7 unit tests** covering valid predictions, edge cases, and error handling—all of which pass with 100% success.*
>
> *I have documented the complete endpoint specifications in our repository, and with the backend fully verified, I have handed over the clean API contracts to Himesh for the frontend UI. Thank you."*

---

## 5. Examiner Viva Questions & Answers (Cheat Sheet)

### **Q1: Why did you choose FastAPI instead of Flask?**
> **Answer:** *"FastAPI is built on modern asynchronous Python (ASGI) and is significantly faster than Flask. In addition, FastAPI has built-in data validation using Pydantic and automatically generates interactive Swagger documentation at `/docs`, which made team collaboration and testing much faster."*

### **Q2: Where does the model come from and how do you load it?**
> **Answer:** *"The model was trained and serialized by our ML lead using Scikit-learn and saved as `models/best_model.joblib`. In FastAPI, I use `joblib.load()` inside a startup lifespan manager so the model loads once into memory when the server boots up, avoiding disk read overhead during requests."*

### **Q3: What is CORS and why did you configure it?**
> **Answer:** *"CORS stands for Cross-Origin Resource Sharing. Because our backend runs on port 8000 and the frontend typically runs on a different port (like 3000 or 5500), web browsers block cross-origin requests by default for security. Adding CORSMiddleware allows our frontend to communicate with our API without browser restrictions."*

### **Q4: How does the API decide between COP and DROP?**
> **Answer:** *"The model predicts the secondary market price. The API calculates: `Profit = Predicted Price - Retail Price`. Then it computes `Profit Margin % = Profit / Retail Price`. If that margin is 15% or higher, the verdict is 'COP' (buy); otherwise, it's 'DROP' (skip)."*

### **Q5: What happens if a user submits an invalid brand or a negative price?**
> **Answer:** *"Pydantic validates the input fields before the function runs. If a price is negative or zero, it raises a `422 Unprocessable Entity`. If an unsupported brand is sent, our endpoint raises a clear `400 Bad Request` explaining which brands are supported."*

---

## 6. How to Demo Live During the Presentation

### 1. Start the API
```bash
uvicorn api.main:app --reload --port 8000
```

### 2. Show the Interactive Swagger UI
Open your browser and navigate to:
```
http://localhost:8000/docs
```
* Click on `GET /health` $\rightarrow$ Click **Try it out** $\rightarrow$ Click **Execute** (shows `"model_status": "connected"`).
* Click on `POST /predict` $\rightarrow$ Click **Try it out** $\rightarrow$ Paste this payload:
```json
{
  "brand": "Yeezy",
  "retail_price": 220.0,
  "shoe_size": 10.5,
  "days_since_release": 45,
  "threshold": 0.15
}
```
* Click **Execute** $\rightarrow$ Show the response returning `"verdict": "COP"` and `"estimated_resale_price": 340.91`.

### 3. Run the Automated Tests in Front of Examiners
```bash
python -m unittest tests/test_api.py
```
*(Demonstrates 7 passed tests in under 2 seconds).*
