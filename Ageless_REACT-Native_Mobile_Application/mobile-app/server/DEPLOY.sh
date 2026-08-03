#!/bin/bash
# Backend Deployment Script for Render
# This script helps deploy the SterlingFit backend API to Render

echo "🚀 SterlingFit Backend Deployment Setup"
echo "===================================="
echo ""
echo "This script will guide you through deploying the backend API to Render."
echo ""

# Database URL
DB_URL="postgresql://fitness_tracker_db_ewht_user:m4sxNiEGxSkhPYpHJDI6uiL2rIu41GsD@dpg-d2g5j8fdiees73d3nne0-a.virginia-postgres.render.com/fitness_tracker_db_ewht"

echo "✅ Database URL found:"
echo "   $DB_URL"
echo ""

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
echo "✅ Generated JWT_SECRET:"
echo "   $JWT_SECRET"
echo ""

echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Go to: https://dashboard.render.com"
echo ""
echo "2. Click 'New +' → 'Web Service'"
echo ""
echo "3. Connect GitHub:"
echo "   - Select: Merriwood/Ageless_React_Native_Mobile_App"
echo ""
echo "4. Configure Service:"
echo "   - Name: ageless-api"
echo "   - Root Directory: Old_Ageless_Web_PWA/PWA_Source_Code/server"
echo "   - Runtime: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Plan: Free"
echo ""
echo "5. Add Environment Variables:"
echo "   NODE_ENV=production"
echo "   PORT=10000"
echo "   DATABASE_URL=$DB_URL"
echo "   JWT_SECRET=$JWT_SECRET"
echo "   CORS_ORIGIN=https://locali-corp.onrender.com"
echo ""
echo "6. Click 'Create Web Service' and wait for deployment"
echo ""
echo "7. Once deployed, test the health endpoint:"
echo "   curl https://ageless-api.onrender.com/api/health"
echo ""
echo "8. Try logging in with:"
echo "   Email: test@ageless.app"
echo "   Password: Test@123"
echo ""
echo "✨ Your backend will be at: https://ageless-api.onrender.com"
