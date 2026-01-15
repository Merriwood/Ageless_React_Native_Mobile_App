#!/bin/bash

################################################################################
# Ageless Maestro Testing Setup Script
#
# Purpose: Automate Maestro preliminary testing setup without Expo Go or EAS Build
# Requirements: Xcode, Node.js, npm, Maestro CLI
#
# Usage: ./setup-maestro-testing.sh [action]
# Actions:
#   - setup    : Full setup (default)
#   - build    : Just build the app
#   - install  : Just install on simulator
#   - test     : Just run Maestro tests
#   - reset    : Clean and start fresh
#   - help     : Show this help message
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Ageless"
PROJECT_SLUG="ageless-fitness"
APP_NAME="mobile-app"
BUNDLE_ID="com.ageless.fitnessapp"
SIMULATOR_DEVICE="iPhone 15"
MAESTRO_FLOWS_DIR="TESTING_AND_QA/maestro"

# Paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR/Ageless_REACT-Native_Mobile_Application/$APP_NAME"
IOS_DIR="$PROJECT_DIR/ios"
BUILD_DIR="$IOS_DIR/build"
APP_BUILD_PATH="$BUILD_DIR/Build/Products/Debug-iphonesimulator/$APP_NAME.app"

################################################################################
# Functions
################################################################################

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
    echo -e "${GREEN}→${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check Xcode
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode not found. Please install Xcode from App Store."
        exit 1
    fi
    print_success "Xcode found: $(xcodebuild -version | head -1)"

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js."
        exit 1
    fi
    print_success "Node.js found: $(node --version)"

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install npm."
        exit 1
    fi
    print_success "npm found: $(npm --version)"

    # Check Maestro
    if ! command -v maestro &> /dev/null; then
        print_warning "Maestro CLI not found. Installing..."
        curl -Ls "https://get.maestro.mobile/install.sh" | bash
        export PATH="$PATH:$HOME/.maestro/bin"
    fi
    print_success "Maestro found: $(maestro --version 2>/dev/null || echo 'installed')"

    # Check project directory
    if [ ! -d "$PROJECT_DIR" ]; then
        print_error "Project directory not found: $PROJECT_DIR"
        exit 1
    fi
    print_success "Project directory found: $PROJECT_DIR"
}

install_dependencies() {
    print_header "Installing Dependencies"

    print_step "Installing npm packages in $PROJECT_DIR..."
    cd "$PROJECT_DIR"
    npm install --legacy-peer-deps
    print_success "npm dependencies installed"

    print_step "Installing CocoaPods dependencies..."
    cd "$IOS_DIR"
    pod install
    print_success "CocoaPods dependencies installed"
    cd "$PROJECT_DIR"
}

generate_native_code() {
    print_header "Generating Native iOS Code"

    print_step "Running expo prebuild..."
    cd "$PROJECT_DIR"

    if [ -d "$IOS_DIR" ]; then
        print_warning "iOS directory already exists. Cleaning..."
        rm -rf "$IOS_DIR"
    fi

    npx expo prebuild --platform ios --clean
    print_success "Native iOS code generated"
}

build_for_simulator() {
    print_header "Building for iOS Simulator"

    if [ ! -d "$IOS_DIR" ]; then
        print_error "iOS directory not found. Please run 'generate_native_code' first."
        exit 1
    fi

    print_step "Building with xcodebuild (this may take 2-5 minutes)..."

    cd "$IOS_DIR"

    # Clean build directory
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
    fi

    # Build
    xcodebuild \
        -workspace "${APP_NAME}.xcworkspace" \
        -scheme "${APP_NAME}" \
        -configuration Debug \
        -derivedDataPath build \
        -sdk iphonesimulator \
        -arch arm64 \
        2>&1 | grep -E "(error|warning|Build complete)" || true

    if [ ! -f "$APP_BUILD_PATH" ]; then
        print_error "Build failed. App not found at $APP_BUILD_PATH"
        exit 1
    fi

    print_success "Build complete!"
    print_info "App location: $APP_BUILD_PATH"
}

setup_simulator() {
    print_header "Setting Up iOS Simulator"

    print_step "Getting available simulators..."

    # Try to find an existing simulator
    SIMULATOR_UDID=$(xcrun simctl list devices available | grep "iPhone 15" | head -1 | grep -oE '\([A-F0-9-]+\)' | tr -d '()' || true)

    if [ -z "$SIMULATOR_UDID" ]; then
        print_warning "iPhone 15 simulator not found. Looking for any iPhone simulator..."
        SIMULATOR_UDID=$(xcrun simctl list devices available | grep "iPhone" | head -1 | grep -oE '\([A-F0-9-]+\)' | tr -d '()' || true)
    fi

    if [ -z "$SIMULATOR_UDID" ]; then
        print_error "No iPhone simulator found. Please create one in Xcode."
        exit 1
    fi

    print_success "Found simulator: $SIMULATOR_UDID"

    # Boot simulator
    print_step "Booting simulator..."
    xcrun simctl boot "$SIMULATOR_UDID" 2>/dev/null || true
    sleep 5  # Wait for simulator to boot
    print_success "Simulator booted"

    # Save UDID for later use
    echo "$SIMULATOR_UDID" > "$SCRIPT_DIR/.simulator_udid"
}

install_app_on_simulator() {
    print_header "Installing App on Simulator"

    if [ ! -f "$APP_BUILD_PATH" ]; then
        print_error "App not found at $APP_BUILD_PATH"
        print_step "Please run 'build' action first."
        exit 1
    fi

    # Get simulator UDID
    if [ ! -f "$SCRIPT_DIR/.simulator_udid" ]; then
        print_error "Simulator UDID not found. Please run 'setup' first."
        exit 1
    fi

    SIMULATOR_UDID=$(cat "$SCRIPT_DIR/.simulator_udid")

    print_step "Installing app on simulator ($SIMULATOR_UDID)..."
    xcrun simctl install "$SIMULATOR_UDID" "$APP_BUILD_PATH"
    print_success "App installed!"

    # Save app info
    echo "$BUNDLE_ID" > "$SCRIPT_DIR/.app_bundle_id"
    echo "$SIMULATOR_UDID" > "$SCRIPT_DIR/.simulator_udid"
}

run_maestro_tests() {
    print_header "Running Maestro Tests"

    if [ ! -f "$SCRIPT_DIR/.simulator_udid" ]; then
        print_error "Simulator not configured. Please run 'setup' first."
        exit 1
    fi

    SIMULATOR_UDID=$(cat "$SCRIPT_DIR/.simulator_udid")

    if [ ! -d "$MAESTRO_FLOWS_DIR" ]; then
        print_error "Maestro flows directory not found: $MAESTRO_FLOWS_DIR"
        exit 1
    fi

    print_step "Running Maestro tests..."
    print_info "Maestro flows directory: $MAESTRO_FLOWS_DIR"

    # Run all flows
    cd "$SCRIPT_DIR"

    if [ -f "$MAESTRO_FLOWS_DIR/test_login_flow.yaml" ]; then
        print_step "Running login flow test..."
        maestro test "$MAESTRO_FLOWS_DIR/test_login_flow.yaml" --udid="$SIMULATOR_UDID" || true
    fi

    if [ -f "$MAESTRO_FLOWS_DIR/test_register_flow.yaml" ]; then
        print_step "Running register flow test..."
        maestro test "$MAESTRO_FLOWS_DIR/test_register_flow.yaml" --udid="$SIMULATOR_UDID" || true
    fi

    if [ -f "$MAESTRO_FLOWS_DIR/test_dashboard_flow.yaml" ]; then
        print_step "Running dashboard flow test..."
        maestro test "$MAESTRO_FLOWS_DIR/test_dashboard_flow.yaml" --udid="$SIMULATOR_UDID" || true
    fi

    print_success "Maestro tests completed!"
}

cleanup() {
    print_header "Cleaning Up"

    print_step "Removing build artifacts..."
    rm -rf "$BUILD_DIR"
    print_success "Cleanup complete"
}

full_reset() {
    print_header "Full Reset - Cleaning Everything"

    print_warning "This will remove all build artifacts and generated code."
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "Removing iOS directory..."
        rm -rf "$IOS_DIR"

        print_step "Removing build artifacts..."
        rm -rf "$BUILD_DIR"

        print_step "Removing simulator cache..."
        rm -f "$SCRIPT_DIR/.simulator_udid"
        rm -f "$SCRIPT_DIR/.app_bundle_id"

        print_success "Full reset complete"
    else
        print_info "Reset cancelled"
    fi
}

show_help() {
    cat << EOF

${BLUE}Ageless Maestro Testing Setup${NC}

${GREEN}Usage:${NC}
  ./setup-maestro-testing.sh [action]

${GREEN}Actions:${NC}
  setup      Full setup (prebuild + build + install + test) - ${GREEN}RECOMMENDED${NC}
  build      Build the app for simulator only
  install    Install pre-built app on simulator
  test       Run Maestro tests only
  clean      Remove build artifacts
  reset      Full clean and start fresh
  help       Show this help message

${GREEN}Examples:${NC}
  ./setup-maestro-testing.sh setup     # Full setup and test
  ./setup-maestro-testing.sh build     # Just build
  ./setup-maestro-testing.sh test      # Just run tests

${GREEN}Prerequisites:${NC}
  ✓ Xcode (with iOS SDK)
  ✓ Node.js & npm
  ✓ Maestro CLI (auto-installed if missing)
  ✓ Simulator device available

${YELLOW}Note:${NC}
  - No Apple Developer Account required
  - No Expo Go required
  - No EAS Build required
  - First run takes 5-15 minutes
  - Subsequent runs are faster

${BLUE}Configuration:${NC}
  Project: $PROJECT_NAME
  App: $APP_NAME
  Bundle ID: $BUNDLE_ID
  Simulator: $SIMULATOR_DEVICE

EOF
}

################################################################################
# Main Script
################################################################################

# Default action
ACTION="${1:-setup}"

case "$ACTION" in
    setup)
        print_header "Maestro Testing Setup - Full Setup"
        print_info "This will: prebuild, build, install, and test your app"
        print_info "Duration: 5-15 minutes on first run"
        sleep 2
        check_prerequisites
        install_dependencies
        generate_native_code
        build_for_simulator
        setup_simulator
        install_app_on_simulator
        print_header "Setup Complete!"
        print_success "Ready to run Maestro tests"
        print_step "Run the following to start testing:"
        echo -e "  ${GREEN}./setup-maestro-testing.sh test${NC}"
        ;;
    build)
        print_header "Building for Simulator"
        check_prerequisites
        build_for_simulator
        print_success "Build complete"
        ;;
    install)
        print_header "Installing on Simulator"
        check_prerequisites
        setup_simulator
        install_app_on_simulator
        print_success "Installation complete"
        ;;
    test)
        print_header "Running Maestro Tests"
        check_prerequisites
        run_maestro_tests
        ;;
    clean)
        cleanup
        ;;
    reset)
        full_reset
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown action: $ACTION"
        echo ""
        show_help
        exit 1
        ;;
esac

print_success "Done!"
exit 0
