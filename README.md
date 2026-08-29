# FinSpark — Feature Intelligence & User Journey Analytics

## 📌 Overview

FinSpark is a web-based analytics platform that helps organizations understand how users interact with their applications.

It tracks feature usage and user journeys and converts this data into actionable insights through interactive dashboards. The platform also uses Machine Learning for churn prediction, user segmentation, and anomaly detection.
---

## 🌐 Live Demo

Static front-end pages are deployed via GitHub Pages for preview purposes:

- **Login Page:** [Login Page](https://oorjatiwari23.github.io/finspark/login.html)
- **Demo App (LendPro):** [LendPro Demo](https://oorjatiwari23.github.io/finspark/demo-app/index.html)

## 🎯 Problem

Organizations often have many application features but lack clear visibility into:

- Which features are actually being used
- Where users drop off during a journey
- Which customers are highly engaged or at risk
- Which licensed features are underutilized
- Whether unusual usage patterns are occurring

FinSpark addresses these challenges by collecting and analyzing application usage data.

## 🔄 How It Works

User Interaction  
↓  
JavaScript Feature Tracker SDK  
↓  
Event Collection  
↓  
Node.js + Express Backend  
↓  
Cloud / On-Premise Processing  
↓  
Database  
↓  
Analytics APIs  
↓  
React Dashboard

A separate Python Flask ML service processes behavioral data for prediction, segmentation, and anomaly detection.

## 🚀 Key Features

### Feature Tracking
- Tracks feature usage, sessions, and user journeys.
- Uses a lightweight JavaScript SDK with `data-feature` attributes.
- Collects event details such as feature name, timestamp, session ID, and tenant ID.

### User Journey & Funnel Analysis
- Tracks the sequence of features used by users.
- Identifies journey drop-offs and conversion points.
- Helps organizations understand where users leave a workflow.

### Analytics Dashboard
Provides interactive views for:

- Feature Usage & Heatmaps
- Journey Funnels
- Tenant Comparison
- License ROI
- Live Event Stream
- Compliance & Audit Information

### Cloud & On-Premise Support
- **Cloud:** Supports detailed event collection and analysis.
- **On-Premise:** Aggregates usage data before synchronization.
- Designed to support privacy and data-residency requirements.

## 🤖 Machine Learning

FinSpark includes a separate Python Flask ML service built using Scikit-learn.

| ML Model | Purpose |
|----------|---------|
| Random Forest | Churn Prediction |
| K-Means | User Segmentation |
| Isolation Forest | Anomaly Detection |
| Z-score | Usage Anomaly Analysis |

### Churn Prediction
Uses behavioral features such as total events, features used, sessions, and inactivity to estimate churn risk.

### User Segmentation
Groups users or tenants based on their usage behavior into meaningful behavioral segments.

### Anomaly Detection
Identifies unusual usage patterns in tenant, feature, and time-based activity.

> Since this is a prototype, churn labels are generated using engagement and inactivity-based rules rather than real historical churn outcomes.

## 🔐 Privacy & Security

FinSpark includes:

- Multiple privacy levels
- Sensitive data masking
- Tenant-based data separation
- JWT authentication
- Role-based access
- Audit logging

Sensitive fields can be sanitized before being processed or stored.

## 🛠️ Technology Stack

**Frontend:** React, Vite, Recharts  
**Backend:** Node.js, Express.js, SQLite  
**ML:** Python, Flask, Scikit-learn, Pandas, NumPy  
**SDK:** Vanilla JavaScript  
**Authentication:** JWT

## 📁 Project Structure

- `sdk/` — JavaScript feature tracking SDK
- `backend/` — Node.js & Express backend
- `dashboard/` — React analytics dashboard
- `ml-service/` — Python Flask ML service
- `demo-app/` — Demo lending application

## 💡 Example

Consider a loan application journey:

**Loan Application → Credit Check → Document Upload → Loan Approval → Disbursement**

If many users leave between **Document Upload** and **Loan Approval**, FinSpark can identify this drop-off through journey analytics.

Similarly, it can identify underused features, compare tenant behavior, predict churn risk, and detect unusual activity.

## 🎯 Outcome

FinSpark combines **event tracking, analytics, interactive dashboards, and Machine Learning** to transform application usage data into actionable insights for better decision-making.

## 🔮 Future Scope

- Scale event processing using message queues such as Kafka
- Replace SQLite with a production-scale database
- Train churn models using real historical customer outcomes
- Add stronger production-grade security and monitoring
