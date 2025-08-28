#!/usr/bin/env node

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

// Import models and utilities
const FoodItem = require('../server/models/FoodItem');
const { foldName } = require('../server/lib/meal/norm');

// Configuration
const CONFIG = {
  USDA_API_KEY: process.env.USDA_API_KEY,
  OFF_DISABLE: process.env.OFF_DISABLE === 'true',
  QA_ATWATER_TOLERANCE: parseInt(process.env.SEED_QA_ATWATER_TOLERANCE) || 30,
  QA_PORTION_BANDS: JSON.parse(process.env.SEED_QA_PORTION_BANDS || '{"roti": [35,60], "idli": [80,180]}'),
  REPORTS_DIR: path.join(__dirname, '../reports')
};

// Ensure reports directory exists
if (!fs.existsSync(CONFIG.REPORTS_DIR)) {
  fs.mkdirSync(CONFIG.REPORTS_DIR, { recursive: true });
}

class SeedUpgrader {
  constructor() {
    this.qaResults = {
      errors: [],
      warnings: [],
      metrics: {
        totalItems: 0,
        atwaterViolations: 0,
        portionViolations: 0,
        giViolations: 0,
        enumViolations: 0,
        duplicates: 0
      }
    };
  }

  async connectDB() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lyfe', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  async disconnectDB() {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }

  // Step 1: Ingest data from various sources
  async ingest() {
    console.log('\n🌱 Step 1: Ingesting data from sources...');
    
    const ingestedData = [];
    
    // Ingest IFCT CSV
    try {
      const ifctData = await this.ingestIFCT();
      ingestedData.push(...ifctData);
      console.log(`✅ Ingested ${ifctData.length} items from IFCT`);
    } catch (error) {
      console.error('❌ IFCT ingestion failed:', error.message);
    }

    // Ingest USDA if API key available
    if (CONFIG.USDA_API_KEY) {
      try {
        const usdaData = await this.ingestUSDA();
        ingestedData.push(...usdaData);
        console.log(`✅ Ingested ${usdaData.length} items from USDA`);
      } catch (error) {
        console.error('❌ USDA ingestion failed:', error.message);
      }
    } else {
      console.log('⚠️  USDA API key not provided, skipping USDA ingestion');
    }

    // Ingest Open Food Facts if enabled
    if (!CONFIG.OFF_DISABLE) {
      try {
        const offData = await this.ingestOpenFoodFacts();
        ingestedData.push(...offData);
        console.log(`✅ Ingested ${offData.length} items from Open Food Facts`);
      } catch (error) {
        console.error('❌ Open Food Facts ingestion failed:', error.message);
      }
    } else {
      console.log('⚠️  Open Food Facts disabled, skipping OFF ingestion');
    }

    return ingestedData;
  }

  async ingestIFCT() {
    const csvPath = path.join(__dirname, '../data/ifct_seed.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const data = this.parseCSV(csvContent);
    
    return data.map(item => {
      // Determine appropriate traditional units based on food type
      const traditionalUnits = this.getTraditionalUnitsForFood(item);
      
      return {
        name: item.name,
        source: 'IFCT',
        externalId: null,
        portionGramsDefault: parseInt(item.portion_grams_default) || 100,
        portionUnits: traditionalUnits,
        nutrients: {
          kcal: parseFloat(item.kcal_per_100g) || 0,
          protein: parseFloat(item.protein_g_per_100g) || 0,
          fat: parseFloat(item.fat_g_per_100g) || 0,
          carbs: parseFloat(item.carbs_g_per_100g) || 0,
          fiber: parseFloat(item.fiber_g_per_100g) || 0,
          sugar: parseFloat(item.sugar_g_per_100g) || 0,
          vitaminC: parseFloat(item.vitaminC_mg_per_100g) || 0,
          zinc: parseFloat(item.zinc_mg_per_100g) || 0,
          selenium: parseFloat(item.selenium_ug_per_100g) || 0,
          iron: parseFloat(item.iron_mg_per_100g) || 0,
          omega3: parseFloat(item.omega3_g_per_100g) || 0
        },
        tags: item.tags ? item.tags.split('|') : [],
        provenance: {
          'nutrition': {
            source: 'IFCT',
            origin: 'measured',
            confidence: 0.9,
            lastVerifiedAt: new Date(),
            notes: 'IFCT database values'
          }
        }
      };
    });
  }

  getTraditionalUnitsForFood(item) {
    const foodName = item.name.toLowerCase();
    const tags = item.tags ? item.tags.split('|') : [];
    const portionGrams = parseInt(item.portion_grams_default) || 100;
    
    const units = [];
    
    // Add default gram-based unit
    units.push({
      unit: 'grams',
      grams: portionGrams,
      description: `${portionGrams}g portion`,
      isDefault: true,
      commonFoods: ['all']
    });
    
    // Add traditional units based on food type
    if (foodName.includes('roti') || foodName.includes('chapati') || foodName.includes('phulka')) {
      units.push({
        unit: 'roti',
        grams: 45,
        description: 'Standard roti',
        isDefault: false,
        commonFoods: ['roti', 'chapati', 'phulka']
      });
      units.push({
        unit: 'piece',
        grams: 45,
        description: '1 piece',
        isDefault: false,
        commonFoods: ['roti', 'chapati', 'phulka']
      });
    }
    
    if (foodName.includes('idli')) {
      units.push({
        unit: 'idli',
        grams: 120,
        description: 'Standard idli',
        isDefault: false,
        commonFoods: ['idli', 'steamed_cakes']
      });
      units.push({
        unit: 'piece',
        grams: 120,
        description: '1 piece',
        isDefault: false,
        commonFoods: ['idli', 'steamed_cakes']
      });
    }
    
    if (foodName.includes('dal') || foodName.includes('curry') || foodName.includes('sabzi')) {
      units.push({
        unit: 'katori',
        grams: 80,
        description: 'Medium katori',
        isDefault: false,
        commonFoods: ['dal', 'curry', 'sabzi', 'gravy']
      });
      units.push({
        unit: 'cup',
        grams: 200,
        description: 'Standard cup',
        isDefault: false,
        commonFoods: ['dal', 'curry', 'sabzi', 'gravy']
      });
    }
    
    if (foodName.includes('rice') || foodName.includes('pulao') || foodName.includes('biryani')) {
      units.push({
        unit: 'katori',
        grams: 80,
        description: 'Medium katori',
        isDefault: false,
        commonFoods: ['rice', 'pulao', 'biryani', 'grains']
      });
      units.push({
        unit: 'cup',
        grams: 200,
        description: 'Standard cup',
        isDefault: false,
        commonFoods: ['rice', 'pulao', 'biryani', 'grains']
      });
    }
    
    if (foodName.includes('ghee') || foodName.includes('oil') || foodName.includes('butter')) {
      units.push({
        unit: 'spoon',
        grams: 15,
        description: 'Tablespoon',
        isDefault: false,
        commonFoods: ['ghee', 'oil', 'butter', 'fats']
      });
      units.push({
        unit: 'teaspoon',
        grams: 5,
        description: 'Teaspoon',
        isDefault: false,
        commonFoods: ['ghee', 'oil', 'butter', 'fats']
      });
    }
    
    if (foodName.includes('milk') || foodName.includes('curd') || foodName.includes('lassi')) {
      units.push({
        unit: 'cup',
        grams: 200,
        description: 'Standard cup',
        isDefault: false,
        commonFoods: ['milk', 'curd', 'lassi', 'dairy']
      });
      units.push({
        unit: 'glass',
        grams: 250,
        description: 'Standard glass',
        isDefault: false,
        commonFoods: ['milk', 'curd', 'lassi', 'dairy']
      });
    }
    
    if (foodName.includes('nuts') || foodName.includes('dry fruits') || foodName.includes('seeds')) {
      units.push({
        unit: 'handful',
        grams: 30,
        description: 'Handful',
        isDefault: false,
        commonFoods: ['nuts', 'dry_fruits', 'seeds', 'snacks']
      });
      units.push({
        unit: 'spoon',
        grams: 15,
        description: 'Tablespoon',
        isDefault: false,
        commonFoods: ['nuts', 'dry_fruits', 'seeds', 'snacks']
      });
    }
    
    return units;
  }

  async ingestUSDA() {
    // Placeholder for USDA ingestion
    // Would use USDA FoodData Central API
    return [];
  }

  async ingestOpenFoodFacts() {
    // Placeholder for Open Food Facts ingestion
    // Would use OFF API by barcode/name
    return [];
  }

  parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    const headers = [];
    const data = [];
    
    // Parse headers
    let currentHeader = '';
    let inQuotes = false;
    
    for (let i = 0; i < lines[0].length; i++) {
      const char = lines[0][i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        headers.push(currentHeader.trim());
        currentHeader = '';
      } else {
        currentHeader += char;
      }
    }
    headers.push(currentHeader.trim());
    
    // Parse data rows
    for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
      if (lines[rowIndex].trim()) {
        const row = lines[rowIndex];
        const values = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim());
        
        if (values.length === headers.length) {
          const item = {};
          headers.forEach((header, index) => {
            item[header] = values[index];
          });
          data.push(item);
        }
      }
    }
    
    return data;
  }

  // Step 2: Normalize and merge data
  async normalizeAndMerge(ingestedData) {
    console.log('\n🔄 Step 2: Normalizing and merging data...');
    
    const normalizedData = [];
    const nameFoldMap = new Map();
    
    for (const item of ingestedData) {
      const normalizedItem = {
        ...item,
        nameFold: foldName(item.name),
        aliases: [],
        gi: null,
        gl: null,
        fodmap: 'Unknown',
        novaClass: 1,
        qualityFlags: []
      };

      // Check for duplicates by nameFold
      if (nameFoldMap.has(normalizedItem.nameFold)) {
        const existing = nameFoldMap.get(normalizedItem.nameFold);
        if (existing.source !== normalizedItem.source) {
          // Merge duplicate items
          normalizedItem.aliases.push(existing.name);
          normalizedItem.aliases.push(...existing.aliases);
          this.qaResults.metrics.duplicates++;
          this.qaResults.warnings.push(`Duplicate nameFold: ${normalizedItem.nameFold} from ${existing.source} and ${normalizedItem.source}`);
        }
      }
      
      nameFoldMap.set(normalizedItem.nameFold, normalizedItem);
      normalizedData.push(normalizedItem);
    }

    console.log(`✅ Normalized ${normalizedData.length} items`);
    return normalizedData;
  }

  // Step 3: Derive additional values (GI, NOVA, FODMAP)
  async derive(normalizedData) {
    console.log('\n🧬 Step 3: Deriving additional values...');
    
    for (const item of normalizedData) {
      // Derive GI from seed data if available
      if (item.tags.includes('grain') && item.nutrients.carbs > 5) {
        item.gi = this.deriveGI(item);
        if (!item.provenance) item.provenance = {};
        item.provenance['gi'] = {
          source: 'Heuristic',
          origin: 'estimated',
          confidence: 0.6,
          notes: 'Estimated based on food type and carbohydrate content'
        };
      }

      // Derive NOVA class
      item.novaClass = this.deriveNOVA(item);
      if (!item.provenance) item.provenance = {};
      item.provenance['nova'] = {
        source: 'Rules',
        origin: 'heuristic',
        confidence: 0.7,
        notes: 'Classified based on processing level rules'
      };

      // Derive FODMAP
      item.fodmap = this.deriveFODMAP(item);
      if (!item.provenance) item.provenance = {};
      item.provenance['fodmap'] = {
        source: 'Heuristic',
        origin: 'heuristic',
        confidence: 0.5,
        notes: 'Estimated based on food composition and common FODMAP patterns'
      };
    }

    console.log('✅ Derived GI, NOVA, and FODMAP values');
    return normalizedData;
  }

  deriveGI(item) {
    // Simple GI estimation based on food type
    if (item.tags.includes('wholegrain')) return 45;
    if (item.tags.includes('grain')) return 65;
    if (item.tags.includes('fruit')) return 50;
    return 55;
  }

  deriveNOVA(item) {
    // Simple NOVA classification
    if (item.tags.includes('ultra-processed')) return 4;
    if (item.tags.includes('processed')) return 3;
    if (item.tags.includes('cooked')) return 2;
    return 1;
  }

  deriveFODMAP(item) {
    // Simple FODMAP classification
    if (item.tags.includes('onion') || item.tags.includes('garlic')) return 'High';
    if (item.tags.includes('apple') || item.tags.includes('mango')) return 'Medium';
    if (item.tags.includes('banana') || item.tags.includes('orange')) return 'Low';
    return 'Unknown';
  }

  // Step 4: QA checks
  async runQA(derivedData) {
    console.log('\n🔍 Step 4: Running QA checks...');
    
    this.qaResults.metrics.totalItems = derivedData.length;
    
    for (const item of derivedData) {
      // Atwater energy check
      this.checkAtwater(item);
      
      // Units sanity check
      this.checkUnits(item);
      
      // Portion sanity check
      this.checkPortion(item);
      
      // GI range check
      this.checkGI(item);
      
      // Enum validation
      this.checkEnums(item);
    }

    console.log(`✅ QA completed: ${this.qaResults.errors.length} errors, ${this.qaResults.warnings.length} warnings`);
  }

  checkAtwater(item) {
    const calculatedKcal = 4 * item.nutrients.protein + 4 * item.nutrients.carbs + 9 * item.nutrients.fat;
    const diff = Math.abs(item.nutrients.kcal - calculatedKcal);
    
    if (diff > CONFIG.QA_ATWATER_TOLERANCE) {
      this.qaResults.metrics.atwaterViolations++;
      this.qaResults.errors.push(`Atwater violation: ${item.name} has kcal diff ${diff} > ${CONFIG.QA_ATWATER_TOLERANCE}`);
      item.qualityFlags.push({
        flag: 'ATWATER_DEVIATION',
        level: 'error',
        message: `Atwater violation: kcal diff ${diff}`,
        value: diff,
        threshold: CONFIG.QA_ATWATER_TOLERANCE
      });
    }
  }

  checkUnits(item) {
    if (item.nutrients.vitaminC > 300) {
      this.qaResults.warnings.push(`High vitamin C: ${item.name} has ${item.nutrients.vitaminC}mg`);
      item.qualityFlags.push({
        flag: 'HIGH_VITAMIN_C',
        level: 'warn',
        message: `vitamin C unusually high: ${item.nutrients.vitaminC}mg`,
        value: item.nutrients.vitaminC,
        threshold: 300
      });
    }
    
    if (item.nutrients.zinc > 30) {
      this.qaResults.warnings.push(`High zinc: ${item.name} has ${item.nutrients.zinc}mg`);
      item.qualityFlags.push({
        flag: 'HIGH_ZINC',
        level: 'warn',
        message: `zinc unusually high: ${item.nutrients.zinc}mg`,
        value: item.nutrients.zinc,
        threshold: 30
      });
    }
  }

  checkPortion(item) {
    for (const [key, [min, max]] of Object.entries(CONFIG.QA_PORTION_BANDS)) {
      if (item.name.toLowerCase().includes(key) && (item.portionGramsDefault < min || item.portionGramsDefault > max)) {
        this.qaResults.metrics.portionViolations++;
        this.qaResults.warnings.push(`Portion out of band: ${item.name} has ${item.portionGramsDefault}g, expected ${min}-${max}g`);
        item.qualityFlags.push({
          flag: 'PORTION_OUT_OF_BAND',
          level: 'warn',
          message: `portion ${item.portionGramsDefault}g outside expected range ${min}-${max}g`,
          value: item.portionGramsDefault,
          threshold: [min, max]
        });
      }
    }
  }

  checkGI(item) {
    if (item.gi && (item.gi < 0 || item.gi > 110)) {
      this.qaResults.metrics.giViolations++;
      this.qaResults.errors.push(`GI out of range: ${item.name} has GI ${item.gi}`);
      item.qualityFlags.push({
        flag: 'GI_OUT_OF_RANGE',
        level: 'error',
        message: `GI ${item.gi} outside valid range 0-110`,
        value: item.gi,
        threshold: [0, 110]
      });
    }
    
    if (item.gi && item.provenance?.gi?.origin === 'estimated' && item.nutrients.carbs < 5) {
      this.qaResults.warnings.push(`Low-carb GI estimation: ${item.name} has ${item.nutrients.carbs}g carbs but estimated GI ${item.gi}`);
      item.qualityFlags.push({
        flag: 'LOW_CARB_GI_ESTIMATION',
        level: 'warn',
        message: `low-carb GI estimation may be unreliable`,
        value: item.nutrients.carbs,
        threshold: 5
      });
    }
  }

  checkEnums(item) {
    if (item.fodmap && !['Low', 'Medium', 'High', 'Unknown'].includes(item.fodmap)) {
      this.qaResults.metrics.enumViolations++;
      this.qaResults.errors.push(`Invalid FODMAP: ${item.name} has ${item.fodmap}`);
      item.qualityFlags.push({
        flag: 'INVALID_FODMAP',
        level: 'error',
        message: `invalid FODMAP value: ${item.fodmap}`,
        value: item.fodmap,
        threshold: ['Low', 'Medium', 'High', 'Unknown']
      });
    }
    
    if (item.novaClass && (item.novaClass < 1 || item.novaClass > 4)) {
      this.qaResults.metrics.enumViolations++;
      this.qaResults.errors.push(`Invalid NOVA: ${item.name} has ${item.novaClass}`);
      item.qualityFlags.push({
        flag: 'INVALID_NOVA',
        level: 'error',
        message: `invalid NOVA class: ${item.novaClass}`,
        value: item.novaClass,
        threshold: [1, 2, 3, 4]
      });
    }
  }

  // Step 5: Load to database
  async loadToDB(qaData) {
    console.log('\n💾 Step 5: Loading data to database...');
    
    try {
      // Clear existing items
      await FoodItem.deleteMany({});
      console.log('🗑️  Cleared existing food items');
      
      // Insert new items
      const result = await FoodItem.insertMany(qaData);
      console.log(`✅ Inserted ${result.length} food items`);
      
      // Create indexes
      await FoodItem.createIndexes();
      console.log('✅ Created database indexes');
      
    } catch (error) {
      console.error('❌ Database load failed:', error);
      throw error;
    }
  }

  // Step 6: Generate reports
  async generateReports() {
    console.log('\n📊 Step 6: Generating reports...');
    
    // Markdown report
    const markdownReport = this.generateMarkdownReport();
    fs.writeFileSync(path.join(CONFIG.REPORTS_DIR, 'seed_qa_report.md'), markdownReport);
    
    // CSV report
    const csvReport = this.generateCSVReport();
    fs.writeFileSync(path.join(CONFIG.REPORTS_DIR, 'seed_qa_failures.csv'), csvReport);
    
    console.log('✅ Reports generated in reports/ directory');
  }

  generateMarkdownReport() {
    const { metrics, errors, warnings } = this.qaResults;
    
    let report = `# Seed QA Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += `## Summary\n\n`;
    report += `- **Total Items**: ${metrics.totalItems}\n`;
    report += `- **Errors**: ${errors.length}\n`;
    report += `- **Warnings**: ${warnings.length}\n\n`;
    
    report += `## Metrics\n\n`;
    report += `- Atwater Violations: ${metrics.atwaterViolations}\n`;
    report += `- Portion Violations: ${metrics.portionViolations}\n`;
    report += `- GI Violations: ${metrics.giViolations}\n`;
    report += `- Enum Violations: ${metrics.enumViolations}\n`;
    report += `- Duplicates: ${metrics.duplicates}\n\n`;
    
    if (errors.length > 0) {
      report += `## Errors (Top 20)\n\n`;
      errors.slice(0, 20).forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
      report += `\n`;
    }
    
    if (warnings.length > 0) {
      report += `## Warnings (Top 20)\n\n`;
      warnings.slice(0, 20).forEach((warning, index) => {
        report += `${index + 1}. ${warning}\n`;
      });
      report += `\n`;
    }
    
    return report;
  }

  generateCSVReport() {
    const { errors, warnings } = this.qaResults;
    
    let csv = 'Type,Message\n';
    
    errors.forEach(error => {
      csv += `ERROR,"${error.replace(/"/g, '""')}"\n`;
    });
    
    warnings.forEach(warning => {
      csv += `WARNING,"${warning.replace(/"/g, '""')}"\n`;
    });
    
    return csv;
  }

  // Main execution flow
  async run() {
    try {
      console.log('🚀 Starting Seed Upgrader...\n');
      
      await this.connectDB();
      
      const ingestedData = await this.ingest();
      const normalizedData = await this.normalizeAndMerge(ingestedData);
      const derivedData = await this.derive(normalizedData);
      await this.runQA(derivedData);
      await this.loadToDB(derivedData);
      await this.generateReports();
      
      console.log('\n🎉 Seed Upgrader completed successfully!');
      
      // Exit with error code if there are QA errors
      if (this.qaResults.errors.length > 0) {
        console.log(`\n❌ Exiting with error code due to ${this.qaResults.errors.length} QA errors`);
        process.exit(1);
      }
      
    } catch (error) {
      console.error('\n❌ Seed Upgrader failed:', error);
      process.exit(1);
    } finally {
      await this.disconnectDB();
    }
  }
}

// CLI execution
if (require.main === module) {
  const upgrader = new SeedUpgrader();
  upgrader.run();
}

module.exports = SeedUpgrader;
