# 🚀 DropOrCop: How to Run the Application

This guide contains complete instructions for starting and running both the **FastAPI Machine Learning Backend** and the **Next.js 16 Web Application**.

---

## ⚡ Option 1: One-Click Startup (Recommended)

A convenience script is provided in the project root that starts both the backend and frontend together with a single command.

### **Directory:**
```bash
cd /home/antara/Documents/Project/End-sem
```

### **Command:**
```bash
./run_app.sh
```

> **Note:** Press `Ctrl + C` in your terminal to stop both servers simultaneously.

---

## 🛠️ Option 2: Run in Two Terminals (Detailed Workflow)

Running in two separate terminal windows is recommended during development so you can inspect backend inference logs and frontend console output independently.

### **Terminal 1: FastAPI Backend Service**

The backend runs the trained `RandomForestRegressor` pipeline, validates request payloads, logs predictions to SQLite (`data/droporcop.db`), and exposes REST endpoints.

1. **Navigate to the Project Root:**
   ```bash
   cd /home/antara/Documents/Project/End-sem
   ```

2. **Start the API Server:**
   ```bash
   source venv/bin/activate
   uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
   ```

   *(Alternative: Run directly without activating the virtual environment)*
   ```bash
   ./venv/bin/uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
   ```

---

### **Terminal 2: Next.js Frontend Application**

The frontend provides the interactive 360° sneaker rotators, parameter controls, real-time prediction history ledger, and the redesigned COP/DROP valuation appraisal card.

1. **Navigate to the Frontend Directory:**
   ```bash
   cd /home/antara/Documents/Project/End-sem/frontend/vibe-coding-ui
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **(Optional) Run Optimized Production Build:**
   If you want to run the compiled production build:
   ```bash
   npm run build
   npm run start
   ```

---

## 🌐 Application Endpoints & Browser URLs

Once both servers are running, access the following URLs in your browser:

| Service | URL | Description |
| :--- | :--- | :--- |
| **Web Interface** | [http://localhost:3000](http://localhost:3000) | Full interactive DropOrCop web app |
| **API Swagger Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive Swagger UI for testing API endpoints |
| **API Health Status** | [http://localhost:8000/health](http://localhost:8000/health) | Backend health & model loading diagnostic probe |
| **Catalog Metadata** | [http://localhost:8000/brands](http://localhost:8000/brands) | Supported brand list & MSRP baseline dictionary |

---

## 🧪 Verification & Automated Testing

### 1. Test Backend API & Models
```bash
cd /home/antara/Documents/Project/End-sem
venv/bin/python -m unittest discover tests
```
*(Runs all 31 unit, integration, and concurrency stress tests)*

### 2. Test Frontend Components & Design Tokens
```bash
cd /home/antara/Documents/Project/End-sem/frontend/vibe-coding-ui
npm test
```
*(Validates motion providers, core atoms, 360° rail, and token compliance)*

---

## ❓ Troubleshooting

- **Port 8000 or 3000 Already in Use:**  
  Check active processes holding ports:
  ```bash
  fuser -k 8000/tcp
  fuser -k 3000/tcp
  ```
- **Virtual Environment Missing Packages:**  
  If python packages need reinstalling:
  ```bash
  cd /home/antara/Documents/Project/End-sem
  venv/bin/pip install -r requirements.txt
  ```
- **Frontend Dependencies:**  
  If node_modules need updating:
  ```bash
  cd /home/antara/Documents/Project/End-sem/frontend/vibe-coding-ui
  npm install
  ```
