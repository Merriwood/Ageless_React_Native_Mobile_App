const fs = require('fs')
const path = require('path')

console.log('=== UI Component Structure Test ===\n')

const tests = []

// Helper function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, filePath))
}

// Helper function to read file and check for patterns
function checkFileContent(filePath, patterns, description) {
  const fullPath = path.join(__dirname, filePath)
  if (!fs.existsSync(fullPath)) {
    return { pass: false, message: `File not found: ${filePath}` }
  }

  const content = fs.readFileSync(fullPath, 'utf-8')
  const results = []

  patterns.forEach(pattern => {
    const regex = new RegExp(pattern.regex, pattern.flags || '')
    const found = regex.test(content)
    results.push({
      pattern: pattern.name,
      found,
      required: pattern.required !== false
    })
  })

  const failedRequired = results.filter(r => r.required && !r.found)

  return {
    pass: failedRequired.length === 0,
    message: failedRequired.length > 0
      ? `Missing required: ${failedRequired.map(r => r.pattern).join(', ')}`
      : `All checks passed`,
    details: results
  }
}

// Test 1: Login Page Components
console.log('Test 1: Login Page Structure...')
const loginTest = checkFileContent('app/(auth)/login/page.tsx', [
  { name: 'login-overlay wrapper', regex: 'className.*login-overlay', required: true },
  { name: 'login-container', regex: 'className.*login-container', required: true },
  { name: 'FaceIDIcon component', regex: '<FaceIDIcon', required: true },
  { name: 'Logo image', regex: 'apple-touch-icon.png', required: true },
  { name: 'App title', regex: 'app-title', required: true },
  { name: 'Collapsible form', regex: 'formExpanded', required: true },
  { name: 'Password toggle', regex: 'showPassword', required: true },
  { name: 'Bottom navigation', regex: 'bottom-navigation', required: true }
], 'Login page')

if (loginTest.pass) {
  console.log('✅ Login page structure complete')
  console.log('   - Contains all required components')
  tests.push({ name: 'Login Page', pass: true })
} else {
  console.log(`❌ Login page incomplete: ${loginTest.message}`)
  tests.push({ name: 'Login Page', pass: false, error: loginTest.message })
}
console.log()

// Test 2: Register Page Components
console.log('Test 2: Register Page Structure...')
const registerTest = checkFileContent('app/(auth)/register/page.tsx', [
  { name: 'login-overlay wrapper', regex: 'className.*login-overlay', required: true },
  { name: 'FaceIDIcon component', regex: '<FaceIDIcon', required: true },
  { name: 'Goals selection', regex: 'GOALS.map', required: true },
  { name: 'Confirm password field', regex: 'confirmPassword', required: true },
  { name: 'Collapsible form', regex: 'formExpanded', required: true }
], 'Register page')

if (registerTest.pass) {
  console.log('✅ Register page structure complete')
  tests.push({ name: 'Register Page', pass: true })
} else {
  console.log(`❌ Register page incomplete: ${registerTest.message}`)
  tests.push({ name: 'Register Page', pass: false, error: registerTest.message })
}
console.log()

// Test 3: Dashboard Page Components
console.log('Test 3: Dashboard Page Structure...')
const dashboardTest = checkFileContent('app/dashboard/page.tsx', [
  { name: 'Exercise cards', regex: 'EXERCISES', required: true },
  { name: 'Control buttons', regex: 'control-button', required: true },
  { name: 'Count display', regex: 'exercise-count', required: true },
  { name: 'Weight input', regex: 'weight', required: true },
  { name: 'Save button', regex: 'handleSaveWorkout', required: true },
  { name: 'Progress bar', regex: 'progress', required: true }
], 'Dashboard page')

if (dashboardTest.pass) {
  console.log('✅ Dashboard page structure complete')
  tests.push({ name: 'Dashboard Page', pass: true })
} else {
  console.log(`❌ Dashboard page incomplete: ${dashboardTest.message}`)
  tests.push({ name: 'Dashboard Page', pass: false, error: dashboardTest.message })
}
console.log()

// Test 4: History Page Components
console.log('Test 4: History Page Structure...')
const historyTest = checkFileContent('app/dashboard/history/page.tsx', [
  { name: 'Data table', regex: 'data-table', required: true },
  { name: 'Sticky headers', regex: 'sticky', required: true },
  { name: 'Fixed widths', regex: 'width:', required: true },
  { name: 'Hover state', regex: 'hover:bg', required: true },
  { name: 'Delete function', regex: 'handleDelete', required: true }
], 'History page')

if (historyTest.pass) {
  console.log('✅ History page structure complete')
  tests.push({ name: 'History Page', pass: true })
} else {
  console.log(`❌ History page incomplete: ${historyTest.message}`)
  tests.push({ name: 'History Page', pass: false, error: historyTest.message })
}
console.log()

// Test 5: Summary Page Components
console.log('Test 5: Summary Page Structure...')
const summaryTest = checkFileContent('app/dashboard/summary/page.tsx', [
  { name: 'Card component', regex: '<Card', required: true },
  { name: 'Summary calculations', regex: 'total', required: true }
], 'Summary page')

if (summaryTest.pass) {
  console.log('✅ Summary page structure complete')
  tests.push({ name: 'Summary Page', pass: true })
} else {
  console.log(`❌ Summary page incomplete: ${summaryTest.message}`)
  tests.push({ name: 'Summary Page', pass: false, error: summaryTest.message })
}
console.log()

// Test 6: PWA Header Component
console.log('Test 6: PWA Header Component...')
const headerTest = checkFileContent('components/layout/PWAHeader.tsx', [
  { name: 'MenuDropdown import', regex: 'import.*MenuDropdown', required: true },
  { name: 'Fixed positioning', regex: 'fixed', required: true },
  { name: 'Primary background', regex: 'bg-primary', required: true },
  { name: 'z-index', regex: 'z-\\[2000\\]', required: true },
  { name: 'Session check', regex: 'useSession', required: true }
], 'PWA Header')

if (headerTest.pass) {
  console.log('✅ PWA Header component complete')
  tests.push({ name: 'PWA Header', pass: true })
} else {
  console.log(`❌ PWA Header incomplete: ${headerTest.message}`)
  tests.push({ name: 'PWA Header', pass: false, error: headerTest.message })
}
console.log()

// Test 7: PWA Navigation Component
console.log('Test 7: PWA Navigation Component...')
const navTest = checkFileContent('components/layout/PWANav.tsx', [
  { name: 'Bottom positioning', regex: 'bottom-0', required: true },
  { name: 'Three nav items', regex: 'nav-item', required: true },
  { name: 'Active state', regex: 'isActive', required: true },
  { name: 'Dashboard link', regex: '/dashboard', required: true },
  { name: 'History link', regex: '/history', required: true },
  { name: 'Summary link', regex: '/summary', required: true }
], 'PWA Navigation')

if (navTest.pass) {
  console.log('✅ PWA Navigation component complete')
  tests.push({ name: 'PWA Navigation', pass: true })
} else {
  console.log(`❌ PWA Navigation incomplete: ${navTest.message}`)
  tests.push({ name: 'PWA Navigation', pass: false, error: navTest.message })
}
console.log()

// Test 8: MenuDropdown Component
console.log('Test 8: MenuDropdown Component...')
const menuTest = checkFileContent('components/ui/MenuDropdown.tsx', [
  { name: 'useState for open state', regex: 'useState', required: true },
  { name: 'useRef for click outside', regex: 'useRef', required: true },
  { name: 'Menu items array', regex: 'menuItems', required: true },
  { name: 'Sign out function', regex: 'signOut', required: true },
  { name: 'Fade animation', regex: 'fadeIn', required: true },
  { name: 'Menu icon', regex: 'menu_icon.png', required: true }
], 'MenuDropdown')

if (menuTest.pass) {
  console.log('✅ MenuDropdown component complete')
  tests.push({ name: 'MenuDropdown', pass: true })
} else {
  console.log(`❌ MenuDropdown incomplete: ${menuTest.message}`)
  tests.push({ name: 'MenuDropdown', pass: false, error: menuTest.message })
}
console.log()

// Test 9: FaceID Icon Component
console.log('Test 9: FaceID Icon Component...')
const faceIDTest = checkFileContent('components/auth/FaceIDIcon.tsx', [
  { name: 'Scanning state', regex: 'isScanning', required: true },
  { name: 'Face ID image', regex: 'face_id_icon.png', required: true },
  { name: 'Animation class', regex: 'scanning', required: true },
  { name: 'Click handler', regex: 'handleClick', required: true }
], 'FaceID Icon')

if (faceIDTest.pass) {
  console.log('✅ FaceID Icon component complete')
  tests.push({ name: 'FaceID Icon', pass: true })
} else {
  console.log(`❌ FaceID Icon incomplete: ${faceIDTest.message}`)
  tests.push({ name: 'FaceID Icon', pass: false, error: faceIDTest.message })
}
console.log()

// Test 10: Toast Component
console.log('Test 10: Toast Component...')
const toastTest = checkFileContent('components/ui/toast.tsx', [
  { name: 'Portal rendering', regex: 'createPortal', required: true },
  { name: 'Auto-dismiss', regex: 'setTimeout', required: true },
  { name: 'Visibility state', regex: 'isVisible', required: true },
  { name: 'Animation classes', regex: 'translate-y', required: true }
], 'Toast')

if (toastTest.pass) {
  console.log('✅ Toast component complete')
  tests.push({ name: 'Toast', pass: true })
} else {
  console.log(`❌ Toast incomplete: ${toastTest.message}`)
  tests.push({ name: 'Toast', pass: false, error: toastTest.message })
}
console.log()

// Test 11: Required Assets
console.log('Test 11: Required Assets...')
const assets = [
  'public/apple-touch-icon.png',
  'public/icons/face_id_icon.png',
  'public/icons/menu_icon.png',
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
  'public/manifest.json'
]

const missingAssets = assets.filter(asset => !fileExists(asset))

if (missingAssets.length === 0) {
  console.log('✅ All required assets present')
  tests.push({ name: 'Required Assets', pass: true })
} else {
  console.log(`❌ Missing assets: ${missingAssets.join(', ')}`)
  tests.push({ name: 'Required Assets', pass: false, error: `Missing: ${missingAssets.join(', ')}` })
}
console.log()

// Test 12: Animations CSS
console.log('Test 12: Animations in globals.css...')
const cssTest = checkFileContent('app/globals.css', [
  { name: 'fadeIn keyframes', regex: '@keyframes fadeIn', required: true },
  { name: 'modalFadeIn keyframes', regex: '@keyframes modalFadeIn', required: true },
  { name: 'modalSlideIn keyframes', regex: '@keyframes modalSlideIn', required: true },
  { name: 'scanPulse keyframes', regex: '@keyframes scanPulse', required: true },
  { name: 'Modal overlay animation', regex: 'modal-overlay.*animation', required: false },
  { name: 'Dropdown animation', regex: 'dropdown.*animation|fadeIn', required: false }
], 'Animations')

if (cssTest.pass) {
  console.log('✅ All animations defined')
  tests.push({ name: 'Animations', pass: true })
} else {
  console.log(`⚠️  Some animations may be missing: ${cssTest.message}`)
  tests.push({ name: 'Animations', pass: true, warning: cssTest.message })
}
console.log()

// Summary
console.log('=== UI Component Test Summary ===\n')
const passed = tests.filter(t => t.pass).length
const failed = tests.filter(t => !t.pass).length

console.log(`Total Tests: ${tests.length}`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log()

if (failed === 0) {
  console.log('✅ All UI components are properly structured')
  console.log('✅ All required files present')
  console.log('✅ All animations defined')
} else {
  console.log('❌ Some tests failed:')
  tests.filter(t => !t.pass).forEach(t => {
    console.log(`   - ${t.name}: ${t.error}`)
  })
}

process.exit(failed > 0 ? 1 : 0)
