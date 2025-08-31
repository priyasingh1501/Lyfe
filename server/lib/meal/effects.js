/**
 * Meal effects computation logic
 */

/**
 * Compute all meal effects
 * @param {Object} totals - Nutrient totals
 * @param {Object} badges - Badge information
 * @param {Object} context - Meal context
 * @returns {Object} - Effects for all 7 categories
 */
function computeMealEffects(totals, badges, context = {}) {
  return {
    // Core Body Effect Categories
    fatForming: computeFatForming(totals, badges, context),
    strength: computeStrength(totals, badges, context),
    immunity: computeImmunity(totals, badges, context),
    inflammation: computeInflammation(totals, badges, context),
    
    // Everyday Felt Effects
    energizing: computeEnergizing(totals, badges, context),
    gutFriendly: computeGutFriendly(totals, badges, context),
    moodLifting: computeMoodLifting(totals, badges, context)
  };
}

/**
 * Compute fat-forming effect (0-10, lower is better)
 * @param {Object} totals - Nutrient totals
 * @param {Object} badges - Badge information
 * @param {Object} context - Meal context
 * @returns {Object} - Fat-forming score and reasons
 */
function computeFatForming(totals, badges, context) {
  let score = 0;
  const reasons = [];

  // High fat content (0-3 points)
  const fatGrams = totals.fat || 0;
  if (fatGrams >= 50) {
    score += 3;
    reasons.push('Very high fat content (≥50g) promotes fat storage');
  } else if (fatGrams >= 35) {
    score += 2;
    reasons.push('High fat content (≥35g) may contribute to weight gain');
  } else if (fatGrams >= 25) {
    score += 1;
    reasons.push('Moderate fat content (≥25g)');
  }

  // High sugar content (0-3 points)
  const sugarGrams = totals.sugar || 0;
  if (sugarGrams >= 30) {
    score += 3;
    reasons.push('Very high sugar content (≥30g) promotes fat storage');
  } else if (sugarGrams >= 20) {
    score += 2;
    reasons.push('High sugar content (≥20g) may contribute to weight gain');
  } else if (sugarGrams >= 15) {
    score += 1;
    reasons.push('Moderate sugar content (≥15g)');
  }

  // Refined carbs (0-2 points)
  if (badges.gi && badges.gi >= 70) {
    score += 2;
    reasons.push('High glycemic index (≥70) promotes fat storage');
  } else if (badges.gi && badges.gi >= 55) {
    score += 1;
    reasons.push('Moderate glycemic index (≥55)');
  }

  // Ultra-processed foods (0-2 points)
  if (badges.nova >= 4) {
    score += 2;
    reasons.push('Ultra-processed foods (NOVA 4) promote fat storage');
  } else if (badges.nova >= 3) {
    score += 1;
    reasons.push('Processed foods (NOVA 3) may contribute to weight gain');
  }

  // Clamp score to 0-10 range
  score = Math.max(0, Math.min(10, score));

  return {
    score,
    reasons,
    level: getFatFormingLevel(score)
  };
}

/**
 * Compute strength effect (0-10)
 * @param {Object} totals - Nutrient totals
 * @param {Object} badges - Badge information
 * @param {Object} context - Meal context
 * @returns {Object} - Strength score and reasons
 */
function computeStrength(totals, badges, context) {
  let score = 0;
  const reasons = [];

  // Protein contribution (0-7 points)
  const proteinGrams = totals.protein || 0;
  if (proteinGrams >= 40) {
    score += 7;
    reasons.push('Excellent protein content (≥40g) for muscle building');
  } else if (proteinGrams >= 30) {
    score += 6;
    reasons.push('Very good protein content (≥30g) for strength');
  } else if (proteinGrams >= 20) {
    score += 5;
    reasons.push('Good protein content (≥20g) for maintenance');
  } else if (proteinGrams >= 15) {
    score += 3;
    reasons.push('Moderate protein content (≥15g)');
  } else if (proteinGrams >= 10) {
    score += 1;
    reasons.push('Low protein content (≥10g)');
  } else {
    reasons.push('Very low protein content (<10g)');
  }

  // Post-workout bonus (+2 points)
  if (context.postWorkout) {
    const carbsGrams = totals.carbs || 0;
    const bodyMassKg = context.bodyMassKg || 70;
    const requiredCarbs = Math.max(50, bodyMassKg * 0.8);
    
    if (carbsGrams >= requiredCarbs) {
      score += 2;
      reasons.push(`Post-workout carbs (${carbsGrams}g) for glycogen replenishment`);
    } else {
      reasons.push(`Post-workout carbs (${carbsGrams}g) below optimal (${requiredCarbs}g)`);
    }
  }

  // Iron contribution (+1 point)
  const ironMg = totals.iron || 0;
  if (ironMg >= 6) {
    score += 1;
    reasons.push('Good iron content (≥6mg) for oxygen transport');
  } else if (ironMg >= 3) {
    reasons.push('Moderate iron content (≥3mg)');
  } else {
    reasons.push('Low iron content (<3mg)');
  }

  // Clamp score to 0-10 range
  score = Math.max(0, Math.min(10, score));

  return {
    score,
    reasons,
    level: getStrengthLevel(score)
  };
}

/**
 * Compute immunity effect (0-10)
 * @param {Object} totals - Nutrient totals
 * @param {Object} badges - Badge information
 * @param {Object} context - Meal context
 * @returns {Object} - Immunity score and reasons
 */
function computeImmunity(totals, badges, context) {
  let score = 0;
  const reasons = [];

  // Fiber contribution (+3 points)
  const fiberGrams = totals.fiber || 0;
  if (fiberGrams >= 8) {
    score += 3;
    reasons.push('Excellent fiber content (≥8g) for gut health');
  } else if (fiberGrams >= 5) {
    score += 2;
    reasons.push('Good fiber content (≥5g) for immunity');
  } else if (fiberGrams >= 3) {
    score += 1;
    reasons.push('Moderate fiber content (≥3g)');
  } else {
    reasons.push('Low fiber content (<3g)');
  }

  // Vitamin C contribution (+2 points)
  const vitaminCMg = totals.vitaminC || 0;
  if (vitaminCMg >= 60) {
    score += 2;
    reasons.push('Excellent vitamin C (≥60mg) for immune function');
  } else if (vitaminCMg >= 30) {
    score += 1;
    reasons.push('Good vitamin C (≥30mg)');
  } else {
    reasons.push('Low vitamin C (<30mg)');
  }

  // Zinc/Selenium contribution (+2 points)
  const zincMg = totals.zinc || 0;
  const seleniumUg = totals.selenium || 0;
  
  if (zincMg >= 5 || seleniumUg >= 30) {
    score += 2;
    if (zincMg >= 5) {
      reasons.push(`Good zinc content (${zincMg}mg) for immune cells`);
    }
    if (seleniumUg >= 30) {
      reasons.push(`Good selenium content (${seleniumUg}µg) for antioxidant defense`);
    }
  } else if (zincMg >= 2 || seleniumUg >= 15) {
    score += 1;
    reasons.push('Moderate zinc/selenium content');
  } else {
    reasons.push('Low zinc/selenium content');
  }

  // Fermented foods bonus (+2 points)
  if (context.fermented) {
    score += 2;
    reasons.push('Contains fermented foods for gut microbiome');
  }

  // Plant diversity bonus (+1 point)
  const plantDiversity = context.plantDiversity || 0;
  if (plantDiversity >= 5) {
    score += 1;
    reasons.push('High plant diversity (≥5 types) for phytonutrients');
  } else if (plantDiversity >= 3) {
    reasons.push('Moderate plant diversity (≥3 types)');
  } else {
    reasons.push('Low plant diversity (<3 types)');
  }

  // Clamp score to 0-10 range
  score = Math.max(0, Math.min(10, score));

  return {
    score,
    reasons,
    level: getImmunityLevel(score)
  };
}

/**
 * Compute inflammation effect (0-10, lower is better)
 * @param {Object} totals - Nutrient totals
 * @param {Object} badges - Badge information
 * @param {Object} context - Meal context
 * @returns {Object} - Inflammation score, reasons, and label
 */
function computeInflammation(totals, badges, context) {
  let score = 5; // Start at neutral (5)
  const reasons = [];

  // Fiber benefit (-2 points)
  const fiberGrams = totals.fiber || 0;
  if (fiberGrams >= 8) {
    score -= 2;
    reasons.push('High fiber (≥8g) reduces inflammation');
  } else if (fiberGrams >= 5) {
    score -= 1;
    reasons.push('Good fiber (≥5g) helps reduce inflammation');
  } else {
    reasons.push('Low fiber (<5g) may contribute to inflammation');
  }

  // Omega-3 benefit (-1 point)
  const omega3Grams = totals.omega3 || 0;
  if (omega3Grams >= 0.5) {
    score -= 1;
    reasons.push('Good omega-3 content (≥0.5g) for anti-inflammatory effects');
  } else if (omega3Grams >= 0.2) {
    reasons.push('Moderate omega-3 content (≥0.2g)');
  } else {
    reasons.push('Low omega-3 content (<0.2g)');
  }

  // Ultra-processed foods risk (+2 points)
  if (badges.nova >= 4) {
    score += 2;
    reasons.push('Ultra-processed foods (NOVA 4) may increase inflammation');
  } else if (badges.nova >= 3) {
    score += 1;
    reasons.push('Processed foods (NOVA 3) may contribute to inflammation');
  }

  // Added sugar risk (+1 point)
  const addedSugar = context.addedSugar || 0;
  if (addedSugar >= 15) {
    score += 1;
    reasons.push('High added sugar (≥15g) may increase inflammation');
  } else if (addedSugar >= 10) {
    reasons.push('Moderate added sugar (≥10g)');
  }

  // High GI risk (+1 point)
  if (badges.gi && badges.gi >= 70) {
    score += 1;
    reasons.push('High glycemic index (≥70) may increase inflammation');
  }

  // Clamp score to 0-10 range
  score = Math.max(0, Math.min(10, score));

  return {
    score,
    reasons,
    label: getInflammationLabel(score)
  };
}

/**
 * Compute energizing effect (0-10)
 * @param {Object} totals - Nutrient totals
 * @param {Object} badges - Badge information
 * @param {Object} context - Meal context
 * @returns {Object} - Energizing score and reasons
 */
function computeEnergizing(totals, badges, context) {
  let score = 5; // Start neutral
  const reasons = [];

  // Complex carbs for sustained energy (+2 points)
  const carbsGrams = totals.carbs || 0;
  if (carbsGrams >= 30) {
    if (badges.gi && badges.gi < 55) {
      score += 2;
      reasons.push('Good complex carbs (≥30g) with low GI for sustained energy');
    } else if (badges.gi && badges.gi < 70) {
      score += 1;
      reasons.push('Moderate carbs (≥30g) for energy');
    }
  }

  // Protein for stable blood sugar (+1 point)
  const proteinGrams = totals.protein || 0;
  if (proteinGrams >= 15) {
    score += 1;
    reasons.push('Good protein (≥15g) for stable blood sugar');
  }

  // Fiber for slow digestion (+1 point)
  const fiberGrams = totals.fiber || 0;
  if (fiberGrams >= 5) {
    score += 1;
    reasons.push('Good fiber (≥5g) for slow, steady energy release');
  }

  // Anti-energizing factors (reduce score)
  if (totals.fat >= 40) {
    score -= 1;
    reasons.push('High fat content (≥40g) may cause sluggishness');
  }

  if (badges.gi && badges.gi >= 70) {
    score -= 1;
    reasons.push('High GI foods may cause energy crashes');
  }

  if (totals.sugar >= 25) {
    score -= 1;
    reasons.push('High sugar (≥25g) may cause energy spikes and crashes');
  }

  // Clamp score to 0-10 range
  score = Math.max(0, Math.min(10, score));

  return {
    score,
    reasons,
    level: getEnergizingLevel(score)
  };
}

/**
 * Compute gut-friendly effect (0-10)
 * @param {Object} totals - Nutrient totals
 * @param {Object} badges - Badge information
 * @param {Object} context - Meal context
 * @returns {Object} - Gut-friendly score and reasons
 */
function computeGutFriendly(totals, badges, context) {
  let score = 5; // Start neutral
  const reasons = [];

  // Fiber for gut health (+3 points)
  const fiberGrams = totals.fiber || 0;
  if (fiberGrams >= 8) {
    score += 3;
    reasons.push('Excellent fiber content (≥8g) for gut health');
  } else if (fiberGrams >= 5) {
    score += 2;
    reasons.push('Good fiber content (≥5g) for gut health');
  } else if (fiberGrams >= 3) {
    score += 1;
    reasons.push('Moderate fiber content (≥3g) for gut health');
  }

  // Fermented foods bonus (+2 points)
  if (context.fermented) {
    score += 2;
    reasons.push('Contains fermented foods for gut microbiome');
  }

  // Plant diversity bonus (+1 point)
  const plantDiversity = context.plantDiversity || 0;
  if (plantDiversity >= 5) {
    score += 1;
    reasons.push('High plant diversity (≥5 types) for gut health');
  } else if (plantDiversity >= 3) {
    score += 1;
    reasons.push('Moderate plant diversity (≥3 types) for gut health');
  }

  // Anti-gut-friendly factors (reduce score)
  if (totals.fat >= 45) {
    score -= 1;
    reasons.push('Very high fat content (≥45g) may cause digestive discomfort');
  }

  if (badges.nova >= 4) {
    score -= 1;
    reasons.push('Ultra-processed foods may irritate the gut');
  }

  if (totals.sugar >= 30) {
    score -= 1;
    reasons.push('High sugar content (≥30g) may feed harmful gut bacteria');
  }

  // Clamp score to 0-10 range
  score = Math.max(0, Math.min(10, score));

  return {
    score,
    reasons,
    level: getGutFriendlyLevel(score)
  };
}

/**
 * Compute mood-lifting effect (0-10)
 * @param {Object} totals - Nutrient totals
 * @param {Object} badges - Badge information
 * @param {Object} context - Meal context
 * @returns {Object} - Mood-lifting score and reasons
 */
function computeMoodLifting(totals, badges, context) {
  let score = 5; // Start neutral
  const reasons = [];

  // Omega-3 for brain health (+2 points)
  const omega3Grams = totals.omega3 || 0;
  if (omega3Grams >= 0.8) {
    score += 2;
    reasons.push('Excellent omega-3 content (≥0.8g) for brain health and mood');
  } else if (omega3Grams >= 0.5) {
    score += 1;
    reasons.push('Good omega-3 content (≥0.5g) for mood support');
  }

  // Magnesium for relaxation (+1 point)
  const magnesiumMg = totals.magnesium || 0;
  if (magnesiumMg >= 100) {
    score += 1;
    reasons.push('Good magnesium content (≥100mg) for relaxation');
  }

  // Tryptophan for serotonin (+1 point)
  const tryptophanMg = totals.tryptophan || 0;
  if (tryptophanMg >= 200) {
    score += 1;
    reasons.push('Good tryptophan content (≥200mg) for serotonin production');
  }

  // Fermented foods for gut-brain axis (+1 point)
  if (context.fermented) {
    score += 1;
    reasons.push('Fermented foods support gut-brain axis and mood');
  }

  // Anti-mood factors (reduce score)
  if (totals.sugar >= 25) {
    score -= 1;
    reasons.push('High sugar (≥25g) may cause mood swings');
  }

  if (badges.nova >= 4) {
    score -= 1;
    reasons.push('Ultra-processed foods may negatively affect mood');
  }

  if (context.addedSugar >= 20) {
    score -= 1;
    reasons.push('High added sugar (≥20g) may cause mood instability');
  }

  // Clamp score to 0-10 range
  score = Math.max(0, Math.min(10, score));

  return {
    score,
    reasons,
    level: getMoodLiftingLevel(score)
  };
}

/**
 * Get strength level description
 * @param {number} score - Strength score
 * @returns {string} - Strength level
 */
function getStrengthLevel(score) {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Very Good';
  if (score >= 4) return 'Good';
  if (score >= 2) return 'Fair';
  return 'Poor';
}

/**
 * Get immunity level description
 * @param {number} score - Immunity score
 * @returns {string} - Immunity level
 */
function getImmunityLevel(score) {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Very Good';
  if (score >= 4) return 'Good';
  if (score >= 2) return 'Fair';
  return 'Poor';
}

/**
 * Get inflammation label
 * @param {number} score - Inflammation score
 * @returns {string} - Inflammation label
 */
function getInflammationLabel(score) {
  if (score <= 3) return 'Low';
  if (score <= 6) return 'Medium';
  return 'High';
}

/**
 * Get fat-forming level description
 * @param {number} score - Fat-forming score
 * @returns {string} - Fat-forming level
 */
function getFatFormingLevel(score) {
  if (score <= 2) return 'Very Low';
  if (score <= 4) return 'Low';
  if (score <= 6) return 'Moderate';
  if (score <= 8) return 'High';
  return 'Very High';
}

/**
 * Get energizing level description
 * @param {number} score - Energizing score
 * @returns {string} - Energizing level
 */
function getEnergizingLevel(score) {
  if (score >= 8) return 'Very Energizing';
  if (score >= 6) return 'Energizing';
  if (score >= 4) return 'Neutral';
  if (score >= 2) return 'Sluggish';
  return 'Very Sluggish';
}

/**
 * Get gut-friendly level description
 * @param {number} score - Gut-friendly score
 * @returns {string} - Gut-friendly level
 */
function getGutFriendlyLevel(score) {
  if (score >= 8) return 'Very Gut-Friendly';
  if (score >= 6) return 'Gut-Friendly';
  if (score >= 4) return 'Neutral';
  if (score >= 2) return 'May Cause Discomfort';
  return 'Likely Uncomfortable';
}

/**
 * Get mood-lifting level description
 * @param {number} score - Mood-lifting score
 * @returns {string} - Mood-lifting level
 */
function getMoodLiftingLevel(score) {
  if (score >= 8) return 'Very Mood-Lifting';
  if (score >= 6) return 'Mood-Lifting';
  if (score >= 4) return 'Neutral';
  if (score >= 2) return 'May Affect Mood';
  return 'Likely Negative';
}

/**
 * Get effects summary for UI
 * @param {Object} effects - Computed effects
 * @returns {Object} - Effects summary
 */
function getEffectsSummary(effects) {
  return {
    // Core Body Effect Categories
    fatForming: {
      ...effects.fatForming,
      icon: '🍔',
      color: getEffectColor(effects.fatForming.score, false) // Lower is better for fat-forming
    },
    strength: {
      ...effects.strength,
      icon: '💪',
      color: getEffectColor(effects.strength.score, true)
    },
    immunity: {
      ...effects.immunity,
      icon: '🌿',
      color: getEffectColor(effects.immunity.score, true)
    },
    inflammation: {
      ...effects.inflammation,
      icon: '🔥',
      color: getEffectColor(effects.inflammation.score, false) // Lower is better for inflammation
    },
    
    // Everyday Felt Effects
    energizing: {
      ...effects.energizing,
      icon: '⚡️',
      color: getEffectColor(effects.energizing.score, true)
    },
    gutFriendly: {
      ...effects.gutFriendly,
      icon: '🌀',
      color: getEffectColor(effects.gutFriendly.score, true)
    },
    moodLifting: {
      ...effects.moodLifting,
      icon: '😊',
      color: getEffectColor(effects.moodLifting.score, true)
    }
  };
}

/**
 * Get effect color for UI
 * @param {number} score - Effect score
 * @param {boolean} higherBetter - Whether higher scores are better
 * @returns {string} - Color class
 */
function getEffectColor(score, higherBetter) {
  if (higherBetter) {
    if (score >= 8) return 'green';
    if (score >= 6) return 'blue';
    if (score >= 4) return 'yellow';
    if (score >= 2) return 'orange';
    return 'red';
  } else {
    // For inflammation, lower is better
    if (score <= 2) return 'green';
    if (score <= 4) return 'blue';
    if (score <= 6) return 'yellow';
    if (score <= 8) return 'orange';
    return 'red';
  }
}

module.exports = {
  computeMealEffects,
  computeFatForming,
  computeStrength,
  computeImmunity,
  computeInflammation,
  computeEnergizing,
  computeGutFriendly,
  computeMoodLifting,
  getEffectsSummary,
  getEffectColor
};
