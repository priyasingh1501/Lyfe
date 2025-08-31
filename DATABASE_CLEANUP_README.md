# Database Cleanup & Duplicate Resolution

## 🚨 **Issues Identified**

After merging multiple food databases (IFCT, USDA, OpenFoodFacts), several structural and duplicate issues were found:

### **1. Duplicate Records**
- Same food items from different sources
- Inconsistent ID formats (`_id`, `id`, `barcode`)
- Similar names with slight variations

### **2. Missing Constraints**
- No unique constraints on `nameFold + source`
- No unique constraints on `externalId + source`
- Potential for future duplicates

### **3. Search Issues**
- Frontend showing duplicate results
- Backend deduplication not comprehensive
- React key warnings due to duplicate IDs

## 🔧 **Fixes Applied**

### **1. Database Schema Updates**
- **Unique Constraints**: Added unique indexes on `nameFold + source` and `externalId + source`
- **Better Indexing**: Added compound indexes for improved search performance
- **Provenance Indexing**: Added index for provenance queries

### **2. Improved Deduplication**
- **Enhanced Algorithm**: Better deduplication logic in search routes
- **Source Priority**: Local database items prioritized over external sources
- **Relevance Scoring**: Better ranking of search results

### **3. Cleanup Scripts**
- **Duplicate Cleaner**: Script to remove existing duplicates
- **Data Validation**: QA checks for data integrity
- **Migration Support**: Tools for ongoing database maintenance

## 🚀 **How to Run the Cleanup**

### **Step 1: Run the Cleanup Script**
```bash
cd scripts
node cleanupDuplicates.js
```

This script will:
- Find and remove duplicate records
- Keep the best version of each food item
- Prioritize local database items
- Report cleanup statistics

### **Step 2: Verify the Fixes**
```bash
# Check if duplicates are gone
cd scripts
node -e "
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const FoodItem = require('../server/models/FoodItem');

async function checkDuplicates() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const duplicates = await FoodItem.aggregate([
    {
      $group: {
        _id: { nameFold: '$nameFold', source: '$source' },
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    }
  ]);
  
  console.log('Remaining duplicates:', duplicates.length);
  await mongoose.disconnect();
}

checkDuplicates();
"
```

### **Step 3: Test the Search**
- Try searching for "rajma" in the GoalAlignedDay food tab
- Verify no duplicate results
- Check that search relevance is improved

## 📊 **Expected Results**

After cleanup:
- ✅ **No duplicate food items**
- ✅ **Unique search results**
- ✅ **Better search relevance**
- ✅ **No React key warnings**
- ✅ **Improved search performance**

## 🔍 **Monitoring & Maintenance**

### **Regular Checks**
Run these queries monthly to monitor for new duplicates:

```javascript
// Check for nameFold duplicates
db.fooditems.aggregate([
  { $group: { _id: { nameFold: "$nameFold", source: "$source" }, count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]);

// Check for externalId duplicates
db.fooditems.aggregate([
  { $match: { externalId: { $exists: true, $ne: null } } },
  { $group: { _id: { externalId: "$externalId", source: "$source" }, count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]);
```

### **Prevention**
- New food imports should use the updated schema
- Run deduplication checks before bulk imports
- Monitor search quality metrics

## 🆘 **Troubleshooting**

### **If Cleanup Fails**
1. Check MongoDB connection
2. Verify environment variables
3. Check for database locks
4. Review error logs

### **If Duplicates Return**
1. Check import processes
2. Verify unique constraints are active
3. Run cleanup script again
4. Review data sources

### **If Search Still Shows Duplicates**
1. Clear browser cache
2. Check frontend deduplication logic
3. Verify backend search results
4. Check for new duplicate imports

## 📝 **Notes**

- **Backup**: Always backup database before running cleanup
- **Testing**: Test in development environment first
- **Monitoring**: Watch for performance impact during cleanup
- **Rollback**: Keep backup for potential rollback

## 🔗 **Related Files**

- `server/models/FoodItem.js` - Updated schema with constraints
- `server/routes/food.js` - Improved deduplication logic
- `scripts/cleanupDuplicates.js` - Duplicate cleanup script
- `client/src/pages/GoalAlignedDay.js` - Frontend search improvements
