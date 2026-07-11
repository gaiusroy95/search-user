const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '../../data')
const VAULT_FILE = path.join(DATA_DIR, 'vault.json')

const EMPTY_VAULT = { categories: [], records: [] }

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readVault() {
  ensureDataDir()
  if (!fs.existsSync(VAULT_FILE)) {
    return { ...EMPTY_VAULT }
  }
  try {
    const raw = fs.readFileSync(VAULT_FILE, 'utf8')
    const data = JSON.parse(raw)
    return {
      categories: Array.isArray(data.categories) ? data.categories : [],
      records: Array.isArray(data.records) ? data.records : [],
    }
  } catch {
    return { ...EMPTY_VAULT }
  }
}

function writeVault(data) {
  ensureDataDir()
  const payload = {
    categories: Array.isArray(data.categories) ? data.categories : [],
    records: Array.isArray(data.records) ? data.records : [],
    updatedAt: new Date().toISOString(),
  }
  fs.writeFileSync(VAULT_FILE, JSON.stringify(payload, null, 2), 'utf8')
  return payload
}

function verifyPassword(password) {
  const expected = process.env.VAULT_PASSWORD || 'kjr;wkj;'
  return password === expected
}

module.exports = {
  readVault,
  writeVault,
  verifyPassword,
}
