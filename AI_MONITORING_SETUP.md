# AI Monitoring System Setup Guide

## Overview

The AI Monitoring System provides automated anomaly detection, error code analysis, and intelligent alerting for your Deye Cloud solar systems.

## Features

1. **Real-time Anomaly Detection**

   - Monitors device status, error codes, battery SOC/SOH
   - Tracks PV production, grid parameters, temperature, load usage
   - Detects values outside normal ranges
   - Identifies patterns before faults occur
   - Flags repeated errors
   - Correlates events (e.g., low PV + high temperature = possible shading/panel issue)

2. **AI-Powered Error Code Explanations**

   - Auto-collects error codes from API responses
   - Uses Ollama LLM to generate human-readable explanations
   - Provides troubleshooting steps
   - Indicates severity and whether onsite visit is needed

3. **Email Alerts**

   - Immediate email notifications for all alerts
   - Detailed error explanations included
   - Uses existing Hostinger SMTP configuration

4. **30-Day Historical Analysis**
   - Stores 30 days of device data
   - Pattern detection (declining efficiency, repeated errors)
   - Trend analysis

## Setup Instructions

### 1. Install Ollama (Free Local LLM)

**Windows:**

1. Download from: https://ollama.ai/download
2. Install and run Ollama
3. Pull a model (recommended: llama3.2):
   ```bash
   ollama pull llama3.2
   ```

**Linux/Mac:**

```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2
```

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Ollama Configuration (optional - defaults shown)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# AI Monitoring Interval (seconds)
AI_MONITORING_INTERVAL=60
```

### 3. Start the Backend Server

The AI monitoring service starts automatically when the backend server starts:

```bash
npm run dev:server
```

Or run both frontend and backend:

```bash
npm run dev:all
```

### 4. Verify AI Monitoring is Running

Check the server console for:

```
AI Monitoring Service initialized (interval: 60s)
Starting AI monitoring cycle...
```

## How It Works

### Monitoring Cycle

1. **Every 60 seconds** (configurable), the service:
   - Fetches all stations and devices from Deye Cloud
   - Gets latest data for each device
   - Detects anomalies using rule-based engine
   - Collects error codes automatically
   - Sends email alerts for any issues found

### Anomaly Detection Rules

The system detects:

- **Device State Errors**: Device offline or in error state
- **Error Codes**: Any error/fault codes from device data
- **Temperature Anomalies**: >80°C or <-10°C
- **Voltage Issues**: Outside 85-115% of normal (230V)
- **Low Battery SOC**: <20%
- **Battery Health**: SOH <80%
- **Low PV Production**: <30% of expected during daytime
- **Correlations**: Low PV + High Temp = possible shading issue

### Error Code Processing

1. When an error code is detected:

   - System checks if code exists in database
   - If not, calls Ollama LLM to generate explanation
   - Saves explanation to database for future use
   - Includes explanation in email alert

2. Error explanations include:
   - Error name/title
   - Severity (info/warning/critical)
   - Likely cause
   - Detailed explanation
   - Troubleshooting steps
   - Whether onsite visit needed
   - Whether owner can fix it

### Email Alerts

Alerts are sent immediately when:

- Any anomaly is detected
- Error codes are found
- Patterns are identified

Email includes:

- Alert type and severity
- Device information
- AI-generated error explanation (if applicable)
- Device data snapshot
- Timestamp

## API Endpoints

### Get AI Alerts

```
GET http://localhost:3001/api/ai-monitoring/alerts?limit=100
```

### Get Error Code Database

```
GET http://localhost:3001/api/ai-monitoring/error-codes
```

### Manually Trigger Monitoring

```
POST http://localhost:3001/api/ai-monitoring/trigger
```

## Frontend Integration

The AI monitoring alerts are automatically displayed in the Admin Monitoring page:

- Purple banner shows AI-detected alerts
- Alerts refresh every 60 seconds
- Shows last 10 alerts with full details

## Troubleshooting

### AI Monitoring Not Starting

1. Check server console for errors
2. Verify Ollama is running: `ollama list`
3. Check environment variables in `.env`
4. Ensure Deye Cloud credentials are correct

### No Email Alerts

1. Verify SMTP settings in `.env`:

   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `RECIPIENT_EMAIL`

2. Check server console for email errors

### Ollama Connection Failed

1. Ensure Ollama is running: `ollama serve`
2. Check `OLLAMA_URL` in `.env` (default: http://localhost:11434)
3. Verify model is installed: `ollama list`
4. If Ollama is unavailable, system will still work but error explanations will be basic

## Cost

- **Ollama**: Completely free (runs locally)
- **Email**: Free (using existing SMTP)
- **Storage**: Minimal (30 days of data)
- **Total**: $0/month

## Customization

### Change Monitoring Interval

In `.env`:

```env
AI_MONITORING_INTERVAL=30  # Check every 30 seconds
```

### Change Ollama Model

In `.env`:

```env
OLLAMA_MODEL=llama3.1  # or any other model
```

### Adjust Anomaly Thresholds

Edit `server/services/aiMonitoringService.js`:

- Temperature thresholds (line ~150)
- Voltage ranges (line ~170)
- Battery SOC threshold (line ~180)
- Production thresholds (line ~250)

## Files Created

- `server/services/aiMonitoringService.js` - Main AI monitoring service
- `server/services/deyeCloudApiWrapper.js` - API wrapper for backend
- `server/data/errorCodes.json` - Error code database (auto-generated)
- Frontend integration in `src/pages/AdminMonitoring.tsx`

## Next Steps

1. Start Ollama and pull a model
2. Restart your backend server
3. Monitor the console for AI monitoring activity
4. Check your email for alerts
5. View AI alerts in the Admin Monitoring page

The system will automatically:

- Start monitoring when server starts
- Collect error codes as they appear
- Generate AI explanations for new errors
- Send email alerts for all issues
- Store 30 days of history for pattern analysis
