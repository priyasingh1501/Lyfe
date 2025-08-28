/**
 * Meal effects computation logic
 */

/**
 * Compute all meal effects
 * @param {Object} totals - Nutrient totals
 * @param {Object} badges - Badge information
 * @param {Object} context - Meal context
 * @returns {Object} - Effects for strength, immunity, and inflammation
 */
function computeMealEffects(totals, badges, context = {}) {
  return {
    strength: computeStrength(totals, badges, context),
    immunity: computeImmunity(totals, badges, context),
    inflammation: computeInflammation(totals, badges, context)
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
 * Get effects summary for UI
 * @param {Object} effects - Computed effects
 * @returns {Object} - Effects summary
 */
function getEffectsSummary(effects) {
  return {
    strength: {
      ...effects.strength,
      icon: '💪',
      color: getEffectColor(effects.strength.score, true)
    },
    immunity: {
      ...effects.immunity,
      icon: '🛡️',
      color: getEffectColor(effects.immunity.score, true)
    },
    inflammation: {
      ...effects.inflammation,
      icon: '🔥',
      color: getEffectColor(effects.inflammation.score, false) // Lower is better for inflammation
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
  computeStrength,
  computeImmunity,
  computeInflammation,
  getEffectsSummary,
  getEffectColor
};
