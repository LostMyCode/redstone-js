struct __cppobj CSkillDefine
{
  unsigned __int16 m_wSerial;                                              // offset: 0000, size: 0002
  unsigned __int16 m_wIconIndex;                                           // offset: 0002, size: 0002
  unsigned __int16 m_wType;                                                // offset: 0004, size: 0002
  unsigned __int16 m_wAction;                                              // offset: 0006, size: 0002
  unsigned __int16 m_wAction2;                                             // offset: 0008, size: 0002
  unsigned __int16 m_wOverlapAction;                                       // offset: 000A, size: 0002
  unsigned __int16 m_wOverlapAction2;                                      // offset: 000C, size: 0002
  unsigned __int16 m_wReiterationDamageCountSyncWithOverlapAction;         // offset: 000E, size: 0002
  unsigned __int16 m_wEnableJob;                                           // offset: 0010, size: 0002
  unsigned __int16 m_wSpeed;                                               // offset: 0012, size: 0002
  unsigned __int16 m_wCorrectFPS;                                          // offset: 0014, size: 0002
  char m_strName[32];                                                      // offset: 0016, size: 0020
  unsigned __int16 m_wDifficultyLevel;                                     // offset: 0036, size: 0002
  unsigned __int16 m_wSkillGroup;                                          // offset: 0038, size: 0002
  unsigned __int16 m_wCastMethod;                                          // offset: 003A, size: 0002
  unsigned __int16 m_wDamageAttribute;                                     // offset: 003C, size: 0002
  unsigned __int16 m_wTargetTypeLimit;                                     // offset: 003E, size: 0002
  unsigned int m_dwTargetMethod;                                           // offset: 0040, size: 0004
  unsigned __int16 m_wSpentHPPercentage;                                   // offset: 0044, size: 0002
  unsigned __int16 m_wSpentHPPercentageBasedBloodWing;                     // offset: 0046, size: 0002
  unsigned __int16 m_wSpentCP;                                             // offset: 0048, size: 0002
  unsigned __int16 m_wSpentCPPerLevel;                                     // offset: 004A, size: 0002
  unsigned __int16 m_wGetCP;                                               // offset: 004C, size: 0002
  unsigned __int16 m_wGetCPPerLevel;                                       // offset: 004E, size: 0002
  unsigned __int16 m_wGetCPTiming;                                         // offset: 0050, size: 0002
  unsigned __int16 m_wMissileDustRange;                                    // offset: 0052, size: 0002
  unsigned __int16 m_wIsNotSyncCP;                                         // offset: 0054, size: 0002
  unsigned __int16 m_wIsMagicDamageBasedLastHitDamage;                     // offset: 0056, size: 0002
  unsigned __int32 m_bf1IsIgnoreWeaponDamage : 1;                          // offset: 0058, size: 0000
  unsigned __int32 m_bf1IsPenetrationRush : 1;                             // offset: 0058, size: 0000
  unsigned __int32 m_bf1IsLoopRushAni : 1;                                 // offset: 0058, size: 0000
  unsigned __int32 m_bf1IsAttackOnlyTargetRush : 1;                        // offset: 0058, size: 0000
  unsigned __int32 m_bf1IsWhirlRunningStyleRush : 1;                       // offset: 0058, size: 0000
  unsigned __int32 m_bf9IsParallellRushAngle : 9;                          // offset: 0058, size: 0001
  unsigned __int32 m_bf8ParallellRushGab : 8;                              // offset: 0059, size: 0001
  unsigned __int32 m_bf1IsShimmeringShieldByWeapon : 1;                    // offset: 005A, size: 0000
  unsigned __int32 m_bf1IsIgnoreTargetDodgeCorrectValue : 1;               // offset: 005A, size: 0000
  unsigned __int32 m_bf1IsSyncShieldShape : 1;                             // offset: 005B, size: 0000
  unsigned __int32 m_bf1IsNotWhirlTornado : 1;                             // offset: 005B, size: 0000
  unsigned __int32 m_bf1SetRushImageByTriggerNextFrame : 1;                // offset: 005B, size: 0000
  unsigned __int32 m_bf1BeastBerserker : 1;                                // offset: 005B, size: 0000
  unsigned __int32 m_bf1IsGlareSkill : 1;                                  // offset: 005B, size: 0000
  unsigned __int32 m_bf1NotRevenge : 1;                                    // offset: 005B, size: 0000
  unsigned __int32 m_bf1IsSummonBeastCommand : 1;                          // offset: 005B, size: 0000
  unsigned __int32 m_bf1IsSummonedBeastSkill : 1;                          // offset: 005B, size: 0000
  cSkillAiPatternInfo m_aAi[8];                                            // offset: 005C, size: 0060
  unsigned __int16 m_wAI_Target;                                           // offset: 00BC, size: 0002
  unsigned __int16 m_wLimitCrushChance;                                    // offset: 00BE, size: 0002
  unsigned __int16 m_wShootRangeCorrect;                                   // offset: 00c0, size: 0002
  unsigned __int16 m_wLimitShotCount;                                      // offset: 00C2, size: 0002
  unsigned __int16 m_wSkillUniqueSpecialFeature;                           // offset: 00C4, size: 0002
  unsigned __int16 m_wImageRadius;                                         // offset: 00C6, size: 0002
  unsigned __int16 m_wOutputEffect;                                        // offset: 00C8, size: 0002
  unsigned __int16 m_wLimitActiveCount;                                    // offset: 00CA, size: 0002
  unsigned __int16 m_wMissileFollowImage;                                  // offset: 00CC, size: 0002
  unsigned __int8 m_aTempBuffer[2];                                        // offset: 00CE, size: 0002
  unsigned __int32 m_bf1IsHideMissImage : 1;                               // offset: 00D0, size: 0000
  unsigned __int32 m_bf1IsRightPunchSkill : 1;                             // offset: 00D0, size: 0000
  unsigned __int32 m_bf1IsLeftPunchSkill : 1;                              // offset: 00D0, size: 0000
  unsigned __int32 m_bf1IsRightKickSkill : 1;                              // offset: 00D0, size: 0000
  unsigned __int32 m_bf1IsLeftKickSkill : 1;                               // offset: 00D0, size: 0000
  unsigned __int32 m_bf1IsDownKickSkill : 1;                               // offset: 00D0, size: 0000
  unsigned __int32 m_bf1IsCancelKnockBackSkill : 1;                        // offset: 00D0, size: 0000
  unsigned __int32 m_bf1IsDecreaseWeaponCount : 1;                         // offset: 00D0, size: 0000
  unsigned __int32 m_bf1IsInstanceApplyAura : 1;                           // offset: 00D1, size: 0000
  unsigned __int32 m_bf1IsDefendOnImageTrap : 1;                           // offset: 00D1, size: 0000
  unsigned __int32 m_bf1IsMonsterCounter : 1;                              // offset: 00D1, size: 0000
  unsigned __int32 m_bf1IsApplyHealPointByPercentage : 1;                  // offset: 00D1, size: 0000
  unsigned __int32 m_bf1IsIgnoreDodgeBlockReaction : 1;                    // offset: 00D1, size: 0000
  unsigned __int32 m_bf1IsAttackDamageBasedAttackerRemainHPRate : 1;       // offset: 00D1, size: 0000
  unsigned __int32 m_bf1IsSelfDestructionSkill : 1;                        // offset: 00D1, size: 0000
  unsigned __int32 m_bf1IsRefitImageSizeByHitRange : 1;                    // offset: 00D1, size: 0000
  unsigned __int32 m_bf1IsCatchAndThrowingTypeAttackPower : 1;             // offset: 00D2, size: 0000
  unsigned __int32 m_bf1IsTagetingToBattleWithPartyMember : 1;             // offset: 00D2, size: 0000
  unsigned __int32 m_bf1IsPutHitDamage : 1;                                // offset: 00D2, size: 0000
  unsigned __int32 m_bf1IsNonAggressiveSkill : 1;                          // offset: 00D2, size: 0000
  unsigned __int32 m_bf1DefensePowerByCurseResistance : 1;                 // offset: 00D2, size: 0000
  unsigned __int32 m_bf1DarkDamageAttackByDamagePoint : 1;                 // offset: 00D2, size: 0000
  unsigned __int32 m_bf1IsPigeonPostItemSkill : 1;                         // offset: 00D2, size: 0000
  unsigned __int32 m_bf1IsLoopLastFrame : 1;                               // offset: 00D2, size: 0000
  unsigned __int32 m_bf1IsCastOnDestPosSkill : 1;                          // offset: 00D3, size: 0000
  unsigned __int32 m_bf1PutTrasAfterAnm : 1;                               // offset: 00D3, size: 0000
  unsigned __int32 m_bf1IsIllusionAttack : 1;                              // offset: 00D3, size: 0000
  unsigned __int32 m_bf1IsResistKnockBackByCurse : 1;                      // offset: 00D3, size: 0000
  unsigned __int32 m_bf1IsRequireFeignDeathStatus : 1;                     // offset: 00D3, size: 0000
  unsigned __int32 m_bf1IsStopWhenFailedFirstSE : 1;                       // offset: 00D3, size: 0000
  unsigned __int32 m_bf1IsToggleSkill : 1;                                 // offset: 00D3, size: 0000
  unsigned __int32 m_bf1IsCastImageOnReleasPos : 1;                        // offset: 00D3, size: 0000
  unsigned __int16 m_wDamageToHP;                                          // offset: 00D4, size: 0002
  unsigned __int16 m_wDamageToHPPerLevel;                                  // offset: 00D6, size: 0002
  unsigned __int16 m_wWADDamageMethod;                                     // offset: 00D8, size: 0002
  unsigned __int16 m_wWADDamageGradeCount;                                 // offset: 00DA, size: 0002
  unsigned __int16 m_wWADDamageValue;                                      // offset: 00DC, size: 0002
  unsigned __int16 m_wWADMaxDamage;                                        // offset: 00DE, size: 0002
  unsigned __int16 m_wWADMinDamage;                                        // offset: 00E0, size: 0002
  unsigned __int16 m_bf1IsIgnoreTargetBlockingChance : 1;                  // offset: 00E2, size: 0000
  unsigned __int16 m_bf1IsRandomDustImageFrame : 1;                        // offset: 00E2, size: 0000
  unsigned __int16 m_bf1IsOnOffSkill : 1;                                  // offset: 00E2, size: 0000
  unsigned __int16 m_bf1IsGroundMissile : 1;                               // offset: 00E2, size: 0000
  unsigned __int16 m_bf1IsApplyPhysicalDamageOnlyTarget : 1;               // offset: 00E2, size: 0000
  unsigned __int16 m_bf1IsParallelAfterImage : 1;                          // offset: 00E2, size: 0000
  unsigned __int16 m_bf1IsSyncSkillExtraEffectWithPlayer : 1;              // offset: 00E2, size: 0000
  unsigned __int16 m_bf1IsMagicDamageBasedRemainHP : 1;                    // offset: 00E2, size: 0000
  unsigned __int16 m_bf1IsZoomInEffectSkill : 1;                           // offset: 00E3, size: 0000
  unsigned __int16 m_bf1IsHpSyncSkill : 1;                                 // offset: 00E3, size: 0000
  unsigned __int16 m_bf1IsTestSkill : 1;                                   // offset: 00E3, size: 0000
  unsigned __int16 m_bf1IsUsHealEffectToHitImageForAuraSkill : 1;          // offset: 00E3, size: 0000
  unsigned __int16 m_bf1IsNotIncreaseByActiveAura : 1;                     // offset: 00E3, size: 0000
  unsigned __int16 m_bf1IsGetCPGasSkillByCasting : 1;                      // offset: 00E3, size: 0000
  unsigned __int16 m_bf1IsRequireMissImage : 1;                            // offset: 00E3, size: 0000
  unsigned __int16 m_bf1IsBlockInDuelField : 1;                            // offset: 00E3, size: 0000
  unsigned __int16 m_wCoolTimeIndex;                                       // offset: 00E4, size: 0002
  unsigned __int16 m_wCoolTime;                                            // offset: 00E6, size: 0002
  unsigned __int16 m_wCoolTimePerLevel;                                    // offset: 00E8, size: 0002
  unsigned __int16 m_wMinimumCoolTime;                                     // offset: 00EA, size: 0002
  unsigned __int16 m_wCorrectTargetDefensivePower;                         // offset: 00EC, size: 0002
  unsigned __int16 m_wPetCommand;                                          // offset: 00EE, size: 0002
  __int16 m_sIncreasePetPowerPerLevel;                                     // offset: 00F0, size: 0002
  unsigned __int16 m_wLimitPhysicalDamage;                                 // offset: 00F2, size: 0002
  unsigned __int16 m_wLimitMagicDamage;                                    // offset: 00F4, size: 0002
  __int16 m_sLimitPhysicalDamagePerLevel;                                  // offset: 00F6, size: 0002
  __int16 m_sLimitMagicDamagePerLevel;                                     // offset: 00F8, size: 0002
  unsigned __int16 m_wCircleRange;                                         // offset: 00FA, size: 0002
  __int16 m_sAuraActivePeriod;                                             // offset: 00FC, size: 0002
  __int16 m_sAuraActivePeriodPerLevel;                                     // offset: 00FE, size: 0002
  __int16 m_sAuraActivePeriodDecimalMethod;                                // offset: 0100, size: 0002
  unsigned __int16 m_wCureEffectField;                                     // offset: 0102, size: 0002
  __int16 m_sApplyLimitHPPercentage;                                       // offset: 0104, size: 0002
  __int16 m_sApplyLimitHPPercentagePerLevel;                               // offset: 0106, size: 0002
  unsigned __int16 m_wLimitApplyLimitHPPercentage;                         // offset: 0108, size: 0002
  __int16 m_sTargetLevelLimitType1;                                        // offset: 010A, size: 0002
  __int16 m_sHumanTargetLevelLimitType1;                                   // offset: 010C, size: 0002
  __int16 m_sAnimalTargetLevelLimitType1;                                  // offset: 010E, size: 0002
  __int16 m_sHolyBeastTargetLevelLimitType1;                               // offset: 0110, size: 0002
  __int16 m_sDemonTargetLevelLimitType1;                                   // offset: 0112, size: 0002
  __int16 m_sUndeadTargetLevelLimitType1;                                  // offset: 0114, size: 0002
  __int16 m_sHealPercentageBasedCurrentHP;                                 // offset: 0116, size: 0002
  __int16 m_sHealPercentageBasedCurrentHPperLevel;                         // offset: 0118, size: 0002
  unsigned __int16 m_wHealPoint;                                           // offset: 011A, size: 0002
  unsigned __int16 m_wHealPointPerLevel;                                   // offset: 011C, size: 0002
  __int16 m_sHideWeaponTime;                                               // offset: 011E, size: 0002
  __int16 m_sHideWeaponTimePerLevel;                                       // offset: 0120, size: 0002
  unsigned __int16 m_wWideAreaAttackDamagePercent;                         // offset: 0122, size: 0002
  unsigned __int16 m_wWideAreaAttackDamagePercentPerLevel;                 // offset: 0124, size: 0002
  unsigned __int16 m_wBlackBluesFactor;                                    // offset: 0126, size: 0002
  unsigned __int16 m_wBlackBluesFactorPerLevel;                            // offset: 0128, size: 0002
  unsigned __int16 m_wBlackBluesFactorLimit;                               // offset: 012A, size: 0002
  __int16 m_sAttackPoint;                                                  // offset: 012C, size: 0002
  __int16 m_sAttackPointPerLevel;                                          // offset: 012E, size: 0002
  __int16 m_sAttackPointRange;                                             // offset: 0130, size: 0002
  __int16 m_sAttackPointRangePerLevel;                                     // offset: 0132, size: 0002
  __int16 m_sCorrectAttackPoint;                                           // offset: 0134, size: 0002
  __int16 m_sAttackPercentage;                                             // offset: 0136, size: 0002
  __int16 m_sAttackPercentagePerLevel;                                     // offset: 0138, size: 0002
  __int16 m_sDefensePoint;                                                 // offset: 013A, size: 0002
  __int16 m_sDefensePointPerLevel;                                         // offset: 013C, size: 0002
  __int16 m_sDefensePercentage;                                            // offset: 013E, size: 0002
  __int16 m_sDefensePercentagePerLevel;                                    // offset: 0140, size: 0002
  __int16 m_sFireDamage;                                                   // offset: 0142, size: 0002
  __int16 m_sFireDamagePerLevel;                                           // offset: 0144, size: 0002
  __int16 m_sFireDamageRange;                                              // offset: 0146, size: 0002
  __int16 m_sFireDamageRangePerLevel;                                      // offset: 0148, size: 0002
  __int16 m_sFireDamagePercentage;                                         // offset: 014A, size: 0002
  __int16 m_sFireDamagePercentagePerLevel;                                 // offset: 014C, size: 0002
  __int16 m_sFireDamagePercentageLimit;                                    // offset: 014E, size: 0002
  __int16 m_sWaterDamage;                                                  // offset: 0150, size: 0002
  __int16 m_sWaterDamagePerLevel;                                          // offset: 0152, size: 0002
  __int16 m_sWaterDamageRange;                                             // offset: 0154, size: 0002
  __int16 m_sWaterDamageRangePerLevel;                                     // offset: 0156, size: 0002
  __int16 m_sWaterDamagePercentage;                                        // offset: 0158, size: 0002
  __int16 m_sWaterDamagePercentagePerLevel;                                // offset: 015A, size: 0002
  __int16 m_sWaterDamagePercentageLimit;                                   // offset: 015C, size: 0002
  __int16 m_sWindDamage;                                                   // offset: 015E, size: 0002
  __int16 m_sWindDamagePerLevel;                                           // offset: 0160, size: 0002
  __int16 m_sWindDamageRange;                                              // offset: 0162, size: 0002
  __int16 m_sWindDamageRangePerLevel;                                      // offset: 0164, size: 0002
  __int16 m_sWindDamagePercentage;                                         // offset: 0166, size: 0002
  __int16 m_sWindDamagePercentagePerLevel;                                 // offset: 0168, size: 0002
  __int16 m_sWindDamagePercentageLimit;                                    // offset: 016A, size: 0002
  __int16 m_sEarthDamage;                                                  // offset: 016C, size: 0002
  __int16 m_sEarthDamagePerLevel;                                          // offset: 016E, size: 0002
  __int16 m_sEarthDamageRange;                                             // offset: 0170, size: 0002
  __int16 m_sEarthDamageRangePerLevel;                                     // offset: 0172, size: 0002
  __int16 m_sEarthDamagePercentage;                                        // offset: 0174, size: 0002
  __int16 m_sEarthDamagePercentagePerLevel;                                // offset: 0176, size: 0002
  __int16 m_sEarthDamagePercentageLimit;                                   // offset: 0178, size: 0002
  __int16 m_sLightDamage;                                                  // offset: 017A, size: 0002
  __int16 m_sLightDamagePerLevel;                                          // offset: 017C, size: 0002
  __int16 m_sLightDamageRange;                                             // offset: 017E, size: 0002
  __int16 m_sLightDamageRangePerLevel;                                     // offset: 0180, size: 0002
  __int16 m_sLightDamagePercentage;                                        // offset: 0182, size: 0002
  __int16 m_sLightDamagePercentagePerLevel;                                // offset: 0184, size: 0002
  __int16 m_sLightDamagePercentageLimit;                                   // offset: 0186, size: 0002
  __int16 m_sDarkDamage;                                                   // offset: 0188, size: 0002
  __int16 m_sDarkDamagePerLevel;                                           // offset: 018A, size: 0002
  __int16 m_sDarkDamageRange;                                              // offset: 018C, size: 0002
  __int16 m_sDarkDamageRangePerLevel;                                      // offset: 018E, size: 0002
  __int16 m_sDarkDamagePercentage;                                         // offset: 0190, size: 0002
  __int16 m_sDarkDamagePercentagePerLevel;                                 // offset: 0192, size: 0002
  __int16 m_sDarkDamagePercentageLimit;                                    // offset: 0194, size: 0002
  __int16 m_sPiercingChance;                                               // offset: 0196, size: 0002
  __int16 m_sPiercingChancePerLevel;                                       // offset: 0198, size: 0002
  unsigned __int16 m_wSpecialEffect;                                       // offset: 019A, size: 0002
  CSkillExtraEffect m_aExtraEffect[10];                                    // offset: 019C, size: 0280
  unsigned __int16 m_wApplyExtraEffectCount;                               // offset: 041C, size: 0002
  unsigned __int16 m_wActivateTrigger;                                     // offset: 041E, size: 0002
  __int16 m_sNockbackDistance;                                             // offset: 0420, size: 0002
  __int16 m_sNockbackDistancePerLevel;                                     // offset: 0422, size: 0002
  __int16 m_sCastingTime;                                                  // offset: 0424, size: 0002
  __int16 m_sAttackSpeed;                                                  // offset: 0426, size: 0002
  __int16 m_sAttackSpeedPerLevel;                                          // offset: 0428, size: 0002
  __int16 m_sLimitAttackSpeed;                                             // offset: 042A, size: 0002
  __int16 m_sCorrectAttackSpeed;                                           // offset: 042C, size: 0002
  __int16 m_sCorrectAttackSpeedPerLevel;                                   // offset: 042E, size: 0002
  unsigned __int16 m_wMinimumShootRange;                                   // offset: 0430, size: 0002
  unsigned __int16 m_wShootRange;                                          // offset: 0432, size: 0002
  unsigned __int16 m_wShootRangePerLevel;                                  // offset: 0434, size: 0002
  unsigned __int16 m_wWeaponShootRangeCorrect;                             // offset: 0436, size: 0002
  unsigned __int16 m_wWeaponShootRangeCorrectPerLevel;                     // offset: 0438, size: 0002
  unsigned __int16 m_wMinimumHitRange;                                     // offset: 043A, size: 0002
  unsigned __int16 m_wHitRange;                                            // offset: 043C, size: 0002
  unsigned __int16 m_wHitRangePerLevel;                                    // offset: 043E, size: 0002
  unsigned __int16 m_wWeaponHitRangeCorrect;                               // offset: 0440, size: 0002
  unsigned __int16 m_wAngle;                                               // offset: 0442, size: 0002
  __int16 m_sHitChance;                                                    // offset: 0444, size: 0002
  __int16 m_sHitChancePerLevel;                                            // offset: 0446, size: 0002
  __int16 m_sFixHitChance;                                                 // offset: 0448, size: 0002
  __int16 m_sDodgeChance;                                                  // offset: 044A, size: 0002
  __int16 m_sDodgeChancePerLevel;                                          // offset: 044C, size: 0002
  __int16 m_sFixDodgeCahnce;                                               // offset: 044E, size: 0002
  __int16 m_sCriticalChance;                                               // offset: 0450, size: 0002
  __int16 m_sCriticalChancePerLevel;                                       // offset: 0452, size: 0002
  __int16 m_sFixCriticalChance;                                            // offset: 0454, size: 0002
  __int16 m_sCrushChance;                                                  // offset: 0456, size: 0002
  __int16 m_sCrushChancePerLevel;                                          // offset: 0458, size: 0002
  __int16 m_sFixCrushChance;                                               // offset: 045A, size: 0002
  __int16 m_sCriticalToUndead;                                             // offset: 045C, size: 0002
  __int16 m_sCriticalToUndeadPerLevel;                                     // offset: 045E, size: 0002
  __int16 m_sCriticalToDemon;                                              // offset: 0460, size: 0002
  __int16 m_sCriticalToDemonPerLevel;                                      // offset: 0462, size: 0002
  __int16 m_sCriticalToAnimal;                                             // offset: 0464, size: 0002
  __int16 m_sCriticalToAnimalPerLevel;                                     // offset: 0466, size: 0002
  __int16 m_sCriticalToHuman;                                              // offset: 0468, size: 0002
  __int16 m_sCriticalToHumanPerLevel;                                      // offset: 046A, size: 0002
  __int16 m_sCriticalToHolyAnimal;                                         // offset: 046C, size: 0002
  __int16 m_sCriticalToHolyAnimalPerLevel;                                 // offset: 046E, size: 0002
  unsigned __int16 m_wInstanceKillMethod;                                  // offset: 0470, size: 0002
  __int16 m_sInstanceKillToUndead;                                         // offset: 0472, size: 0002
  __int16 m_sInstanceKillToDemon;                                          // offset: 0474, size: 0002
  __int16 m_sInstanceKillToAnimal;                                         // offset: 0476, size: 0002
  __int16 m_sInstanceKillToHuman;                                          // offset: 0478, size: 0002
  __int16 m_sInstanceKillToHolyAnimal;                                     // offset: 047A, size: 0002
  __int16 m_sInstanceKillToUndeadPerLevel;                                 // offset: 047C, size: 0002
  __int16 m_sInstanceKillToDemonPerLevel;                                  // offset: 047E, size: 0002
  __int16 m_sInstanceKillToAnimalPerLevel;                                 // offset: 0480, size: 0002
  __int16 m_sInstanceKillToHumanPerLevel;                                  // offset: 0482, size: 0002
  __int16 m_sInstanceKillToHolyAnimalPerLevel;                             // offset: 0484, size: 0002
  __int16 m_sBlockingChance;                                               // offset: 0486, size: 0002
  __int16 m_sBlockingChancePerLevel;                                       // offset: 0488, size: 0002
  __int16 m_sMaximumBlockingChance;                                        // offset: 048A, size: 0002
  __int16 m_sFixBlockingChance;                                            // offset: 048C, size: 0002
  __int16 m_sConcentration;                                                // offset: 048E, size: 0002
  __int16 m_sConcentrationPerLevel;                                        // offset: 0490, size: 0002
  __int16 m_sStunResistance;                                               // offset: 0492, size: 0002
  __int16 m_sStunResistancePerLevel;                                       // offset: 0494, size: 0002
  __int16 m_sStrangeStatusResistance;                                      // offset: 0496, size: 0002
  __int16 m_sStrangeStatusResistancePerLevel;                              // offset: 0498, size: 0002
  __int16 m_sDeclineResistance;                                            // offset: 049A, size: 0002
  __int16 m_sDeclineResistancePerLevel;                                    // offset: 049C, size: 0002
  __int16 m_sCurseResistance;                                              // offset: 049E, size: 0002
  __int16 m_sCurseResistancePerLevel;                                      // offset: 04A0, size: 0002
  __int16 m_sFireResistance;                                               // offset: 04A2, size: 0002
  __int16 m_sFireResistancePerLevel;                                       // offset: 04A4, size: 0002
  __int16 m_sWaterResistance;                                              // offset: 04A6, size: 0002
  __int16 m_sWaterResistancePerLevel;                                      // offset: 04A8, size: 0002
  __int16 m_sWindResistance;                                               // offset: 04AA, size: 0002
  __int16 m_sWindResistancePerLevel;                                       // offset: 04AC, size: 0002
  __int16 m_sEarthResistance;                                              // offset: 04AE, size: 0002
  __int16 m_sEarthResistancePerLevel;                                      // offset: 0480, size: 0002
  __int16 m_sLightResistance;                                              // offset: 0482, size: 0002
  __int16 m_sLightResistancePerLevel;                                      // offset: 04B4, size: 0002
  __int16 m_sDarkResistance;                                               // offset: 04B6, size: 0002
  __int16 m_sDarkResistancePerLevel;                                       // offset: 04B8, size: 0002
  __int16 m_sBulletCount;                                                  // offset: 04BA, size: 0002
  __int16 m_sBulletCountPerLevel;                                          // offset: 04BC, size: 0002
  __int16 m_sBulletLimitCount;                                             // offset: 04BE, size: 0002
  __int16 m_wBulletDecimalMethod;                                          // offset: 04C0, size: 0002
  __int16 m_sShotCount;                                                    // offset: 04C2, size: 0002
  __int16 m_sShotCountPerLevel;                                            // offset: 04C4, size: 0002
  __int16 m_wShotCountDecimalMethod;                                       // offset: 04C6, size: 0002
  __int16 m_sContiniousShotMaxCount;                                       // offset: 04C8, size: 0002
  __int16 m_sContiniousShotCount;                                          // offset: 04CA, size: 0002
  __int16 m_sContiniousShotCountPerLevel;                                  // offset: 04CC, size: 0002
  __int16 m_sContiniousShotPeriod;                                         // offset: 04CE, size: 0002
  __int16 m_wContiniousShotDecimalMethod;                                  // offset: 04D0, size: 0002
  __int16 m_wIncreaseActionAnmCount;                                       // offset: 04D2, size: 0002
  __int16 m_sCorrectTargetHitChance;                                       // offset: 04D4, size: 0002
  __int16 m_sCorrectTargetHitChancePerLevel;                               // offset: 04D6, size: 0002
  unsigned __int16 m_wUpkeepTime;                                          // offset: 04D8, size: 0002
  unsigned __int16 m_wUpkeepTimePerLevel;                                  // offset: 04DA, size: 0002
  __int16 m_sTargetFleeChance;                                             // offset: 04DC, size: 0002
  __int16 m_sTargetStunChance;                                             // offset: 04DE, size: 0002
  __int16 m_sInstanceKillChance;                                           // offset: 04E0, size: 0002
  __int16 m_sInstanceKillChancePerLevel;                                   // offset: 04E2, size: 0002
  __int16 m_sTargetDecreaseHitChance;                                      // offset: 04E4, size: 0002
  __int16 m_sTargetDecreaseHitChancePerLevel;                              // offset: 04E6, size: 0002
  __int16 m_isExemptToDemonType;                                           // offset: 04E8, size: 0002
  __int16 m_isExemptToHumanType;                                           // offset: 04EA, size: 0002
  __int16 m_isExemptToAnimalType;                                          // offset: 04EC, size: 0002
  __int16 m_isExemptToHolyAnimalType;                                      // offset: 04EE, size: 0002
  __int16 m_isExemptToUndeadType;                                          // offset: 04F0, size: 0002
  __int16 m_sIntelligencePerLevel;                                         // offset: 04F2, size: 0002
  __int16 m_sStrengthPerLevel;                                             // offset: 04F4, size: 0002
  __int16 m_sLuckPerLevel;                                                 // offset: 04F6, size: 0002
  __int16 m_sAgilityPerLevel;                                              // offset: 04F8, size: 0002
  __int16 m_sWisdomPerLevel;                                               // offset: 04FA, size: 0002
  __int16 m_sCharismaPerLevel;                                             // offset: 04FC, size: 0002
  __int16 m_sOccurActionPeriod;                                            // offset: 04FE, size: 0002
  __int16 m_sHealPoint;                                                    // offset: 0500, size: 0002
  __int16 m_sHealPointPerLevel;                                            // offset: 0502, size: 0002
  __int16 m_sFirstAidPoint;                                                // offset: 0504, size: 0002
  __int16 m_sFirstAidPointPerLevel;                                        // offset: 0506, size: 0002
  __int16 m_sFirstAidUpkeepTime;                                           // offset: 0508, size: 0002
  __int16 m_sDisarmLevel;                                                  // offset: 050A, size: 0002
  __int16 m_sDisarmLevelPerLevel;                                          // offset: 050C, size: 0002
  __int16 m_sDetectLevelPerLevel;                                          // offset: 050E, size: 0002
  __int16 m_sDetectLevel;                                                  // offset: 0510, size: 0002
  __int16 m_sActiveChance;                                                 // offset: 0512, size: 0002
  __int16 m_sActiveChancePerLevel;                                         // offset: 0514, size: 0002
  unsigned __int16 m_wActiveChanceByInRangeEnemyCount;                     // offset: 0516, size: 0002
  unsigned __int16 m_wLimitActiveChance;                                   // offset: 0518, size: 0002
  unsigned __int16 m_wRequireEquipment;                                    // offset: 051A, size: 0002
  cREQUIRE_SKILL m_aRequireSkill[5];                                       // offset: 051C, size: 0014
  CSkillDefine::CSoundInfo m_sound;                                        // offset: 0530, size: 00C4
  __int16 m_aValue[20];                                                    // offset: 05F4, size: 0028
  unsigned __int16 m_wImageScale;                                          // offset: 061C, size: 0002
  unsigned __int16 m_wTargetMarkImage;                                     // offset: 061E, size: 0002
  unsigned __int16 m_wShootImage;                                          // offset: 0620, size: 0002
  unsigned __int16 m_wMissileHeadImage;                                    // offset: 0622, size: 0002
  unsigned __int16 m_wMachineImage;                                        // offset: 0624, size: 0002
  unsigned __int16 m_wExplosionImage;                                      // offset: 0626, size: 0002
  unsigned __int16 m_wMissImage;                                           // offset: 0628, size: 0002
  unsigned __int16 m_wAidAttackImage;                                      // offset: 062A, size: 0002
  unsigned __int16 m_wAidAttackImageOutputPart;                            // offset: 062C, size: 0002
  unsigned __int16 m_wAidAttackImageEffect;                                // offset: 062E, size: 0002
  unsigned __int16 m_wHitImage;                                            // offset: 0630, size: 0002
  unsigned __int16 m_wHitImageOutputPart;                                  // offset: 0632, size: 0002
  unsigned __int16 m_wHitImageEffect;                                      // offset: 0634, size: 0002
  unsigned __int16 m_wHealImage;                                           // offset: 0636, size: 0002
  unsigned __int16 m_wHealImageOutputPart;                                 // offset: 0638, size: 0002
  unsigned __int16 m_wHealImageEffect;                                     // offset: 063A, size: 0002
  unsigned __int16 m_wAddHitImage;                                         // offset: 063C, size: 0002
  unsigned __int16 m_wAddHitImageOutputPart;                               // offset: 063E, size: 0002
  unsigned __int16 m_wAddHitImageEffect;                                   // offset: 0640, size: 0002
  unsigned __int16 m_wCastImage;                                           // offset: 0642, size: 0002
  unsigned __int16 m_wCastImageOutputPart;                                 // offset: 0644, size: 0002
  unsigned __int16 m_wCastImageEffect;                                     // offset: 0646, size: 0002
  unsigned __int16 m_wAidSkillCastingImage;                                // offset: 0648, size: 0002
  unsigned __int16 m_wAidSkillCastingImageOutputPart;                      // offset: 064A, size: 0002
  unsigned __int16 m_wAidSkillCastingImageEffect;                          // offset: 064C, size: 0002
  unsigned __int16 m_wSkillImage;                                          // offset: 064E, size: 0002
  unsigned __int16 m_wSkillImageOutputPart;                                // offset: 0650, size: 0002
  unsigned __int16 m_wSkillImageEffect;                                    // offset: 0652, size: 0002
  unsigned __int16 m_wCasterHitImage;                                      // offset: 0654, size: 0002
  unsigned __int16 m_wCasterHitImageOutputPart;                            // offset: 0656, size: 0002
  unsigned __int16 m_wCasterHitImageEffect;                                // offset: 0658, size: 0002
  unsigned __int16 m_wSwingImage;                                          // offset: 065A, size: 0002
  unsigned __int16 m_wSwingImageEffect;                                    // offset: 065C, size: 0002
  unsigned __int16 m_wBottomImage;                                         // offset: 065E, size: 0002
  unsigned __int16 m_wDodgeAngle;                                          // offset: 0660, size: 0002
  unsigned __int16 m_wHitAngleRange;                                       // offset: 0662, size: 0002
  unsigned __int16 m_wHitAngleRangePerLevel;                               // offset: 0664, size: 0002
  unsigned __int16 m_wDodgeDistance;                                       // offset: 0666, size: 0002
  unsigned __int16 m_wPaletteIndex;                                        // offset: 0668, size: 0002
  unsigned int m_dwEnchantedEffectMask;                                    // offset: 066C, size: 0004
  unsigned __int16 m_wEnchantedImage;                                      // offset: 0670, size: 0002
  unsigned __int16 m_wDustImageRange;                                      // offset: 0672, size: 0002
  unsigned __int16 m_wShakeTiming;                                         // offset: 0674, size: 0002
  unsigned __int16 m_wShakeIntensity;                                      // offset: 0676, size: 0002
  unsigned __int16 m_wShakeTime;                                           // offset: 0678, size: 0002
  unsigned __int8 m_bCharacterAfterImageType;                              // offset: 067A, size: 0001
  unsigned __int8 m_bCharacterAfterImageDelayTime;                         // offset: 067B, size: 0001
  unsigned __int16 m_wStrikePeriod;                                        // offset: 067C, size: 0002
  __int16 m_sStrikePeriodPerLevel;                                         // offset: 067E, size: 0002
  unsigned __int16 m_wMinimumStrikePeriod;                                 // offset: 0680, size: 0002
  unsigned __int16 m_wAfterImageType;                                      // offset: 0682, size: 0002
  unsigned __int16 m_wAfterImageGap;                                       // offset: 0684, size: 0002
  unsigned __int16 m_wAfterImageFirstImageDistance;                        // offset: 0686, size: 0002
  unsigned __int16 m_wAfterImageFirstImageAlphaDepth;                      // offset: 0688, size: 0002
  unsigned __int16 m_sAfterImageDecreaseAlphaDepthValue;                   // offset: 068A, size: 0002
  unsigned __int16 m_wAfterImageCount;                                     // offset: 068C, size: 0002
  unsigned __int32 m_bf1IsBlockOnlyMissilAttack : 1;                       // offset: 0690, size: 0000
  unsigned __int32 m_bf1IsExclusiveAction : 1;                             // offset: 0690, size: 0000
  unsigned __int32 m_bf5HitDamagePeriod : 5;                               // offset: 0690, size: 0000
  unsigned __int32 m_bf1IsRoundRappedBunshinAttack : 1;                    // offset: 0690, size: 0000
  unsigned __int32 m_bf5BunshineAlphaDepth : 5;                            // offset: 0691, size: 0000
  unsigned __int32 m_bf3MaxPetCount : 3;                                   // offset: 0691, size: 0000
  unsigned __int32 m_bf2RequireSummonBeastGrade : 2;                       // offset: 0692, size: 0000
  unsigned __int32 m_bf2OperateSummonBeast : 2;                            // offset: 0692, size: 0000
  unsigned __int32 m_bf1IsPohibitAction : 1;                               // offset: 0692, size: 0000
  unsigned __int32 m_bf1ShootRangeZeroSkill : 1;                           // offset: 0692, size: 0000
  unsigned __int32 m_bf1IsTrap : 1;                                        // offset: 0692, size: 0000
  unsigned __int32 m_bf1IsFlatTrap : 1;                                    // offset: 0692, size: 0000
  unsigned __int32 m_bf1IsInstanceHeal : 1;                                // offset: 0693, size: 0000
  unsigned __int32 m_bf1IsOnlySelfEnchantSkill : 1;                        // offset: 0693, size: 0000
  unsigned __int32 m_bf1IsSecondJobMachine : 1;                            // offset: 0693, size: 0000
  unsigned __int32 m_bf1IsRapeExplosionImage : 1;                          // offset: 0693, size: 0000
  unsigned __int32 m_bf1IsLaser : 1;                                       // offset: 0693, size: 0000
  unsigned __int32 m_bf1AttackByDamagedDamage : 1;                         // offset: 0693, size: 0000
  unsigned __int32 m_bf1PlayCastSoundByEnchantAidSkill : 1;                // offset: 0693, size: 0000
  unsigned __int32 m_bf1RootAttackPower : 1;                               // offset: 0693, size: 0000
  _union_skill_enchanted_image m_enchantedImage;                           // offset: 0694, size: 000C
  unsigned __int16 m_wCommandSkill;                                        // offset: 06A0, size: 0002
  CSkillDefine::_union_check_status m_checkTargetStatus;                   // offset: 06A4, size: 0004
  CSkillDefine::_union_check_status m_checkCasterStatus;                   // offset: 06A8, size: 0004
  unsigned __int32 m_bf1IsObitianSkill : 1;                                // offset: 06AC, size: 0000
  unsigned __int32 m_bf1IsDashBladeSkill : 1;                              // offset: 06AC, size: 0000
  unsigned __int32 m_bf1IsAstroBowSkill : 1;                               // offset: 06AC, size: 0000
  unsigned __int32 m_bf1IsCristalWaterSkill : 1;                           // offset: 06AC, size: 0000
  unsigned __int32 m_bf1IsApplyToPartyAura : 1;                            // offset: 06AC, size: 0000
  unsigned __int32 m_bf4ChangeDirect : 4;                                  // offset: 06AC, size: 0000
  unsigned __int32 m_bf1IsCastSelfBuff : 1;                                // offset: 06AD, size: 0000
  unsigned __int32 m_bf1IsExplosionAtCastPos : 1;                          // offset: 06AD, size: 0000
  unsigned __int32 m_bf1InsInstanceWaterFall : 1;                          // offset: 06AD, size: 0000
  unsigned __int32 m_bf5MiniPetType : 5;                                   // offset: 06AD, size: 0000
  unsigned __int32 m_bf1IsDefaultMiniPetSkill : 1;                         // offset: 06AE, size: 0000
  unsigned __int32 m_bf5MiniPetSkillType : 5;                              // offset: 06AE, size: 0000
  unsigned __int32 m_bf1IsXMiniPetLevel : 1;                               // offset: 06AE, size: 0000
  unsigned __int32 m_bf4PetSkillDamageExpressionType : 4;                  // offset: 06AF, size: 0000
  unsigned __int32 m_bf1IsNormalMiniPetSkill : 1;                          // offset: 06AF, size: 0000
  unsigned __int32 m_bf1IsDuelCoolTimeSkill : 1;                           // offset: 06AF, size: 0000
  unsigned __int32 m_bf1IsShadowHideSkill : 1;                             // offset: 06AF, size: 0000
  unsigned __int32 m_bf1IsApplyShadowHideEffect : 1;                       // offset: 06AF, size: 0000
  unsigned __int32 m_bf7DuelServerpenaltyDiv : 7;                          // offset: 06B0, size: 0000
  unsigned __int32 m_bf4PetSkillDamageExpressionTypeForAwaken : 4;         // offset: 06B0, size: 0000
  unsigned __int32 m_bf6NeedState : 6;                                     // offset: 06B1, size: 0000
  unsigned __int32 m_bf1IsCancelNeedState : 1;                             // offset: 06B2, size: 0000
  unsigned __int32 m_bf1IsReactionLimitCount : 1;                          // offset: 06B2, size: 0000
  unsigned __int32 m_bf1IsIgnoreOptionAttackSpeed : 1;                     // offset: 06B2, size: 0000
  unsigned __int32 m_bf1IsIgnoreLucky : 1;                                 // offset: 06B2, size: 0000
  unsigned __int32 m_bf1IsRushAttack : 1;                                  // offset: 06B2, size: 0000
  unsigned __int32 m_bf1IsIgnoreDelayAfterAttack : 1;                      // offset: 06B2, size: 0000
  unsigned __int32 m_bf1IsApplyEffectChanceToPlayer : 1;                   // offset: 06B2, size: 0000
  unsigned __int32 m_bf1IsApplyFightingSpirit : 1;                         // offset: 06B3, size: 0000
  unsigned __int32 m_bf1IsCanNotApplySameEffect : 1;                       // offset: 06B3, size: 0000
  unsigned __int32 m_bf1IsTargetingToActorStickedBit : 1;                  // offset: 06B3, size: 0000
  unsigned __int32 m_bf4SpendBit : 4;                                      // offset: 06B3, size: 0000
  unsigned __int32 m_bf1IsApplyCriticalEffectWhenBeLightEffect : 1;        // offset: 06B3, size: 0000
  unsigned __int16 m_wAwakenSkillBonusActiveChance;                        // offset: 06B4, size: 0002
  unsigned __int16 m_wAwakenSkillBonusActiveChancePerLevel;                // offset: 06B6, size: 0002
  __int16 m_wAwakenSkillBonusDamage;                                       // offset: 06B8, size: 0002
  __int16 m_wAwakenSkillBonusDamagePerLevel;                               // offset: 06BA, size: 0002
  __int16 m_wAwakenSkillBonusDamageForOrigin;                              // offset: 06BC, size: 0002
  __int16 m_wAwakenSkillBonusDamagePerLevelForOrigin;                      // offset: 06BE, size: 0002
  __int16 m_wAwakenSkillBonusDamageValueRangeForOrigin;                    // offset: 06C0, size: 0002
  __int16 m_wAwakenSkillBonusDamageValueRangePerLevelForOrigin;            // offset: 06C2, size: 0002
  __int16 m_wAwakenSkillBonusRange;                                        // offset: 06C4, size: 0002
  __int16 m_wAwakenSkillBonusRangePerLevel;                                // offset: 06C6, size: 0002
  __int16 m_wAwakenSkillBonusDamageForBoJoSkill;                           // offset: 06C8, size: 0002
  __int16 m_wAwakenSkillBonusDamageForBoJoSkillPerLevel;                   // offset: 06CA, size: 0002
  __int16 m_wAwakenSkillBonusActiveChanceForBoJoSKill;                     // offset: 06CC, size: 0002
  __int16 m_wAwakenSkillBonusActiveChanceForBoJoSKillPerLevel;             // offset: 06CE, size: 0002
  unsigned __int16 m_wApplyEffectChanceToPlayer;                           // offset: 06D0, size: 0002
  unsigned __int16 m_wApplyEffectChancePerLevelToPlayer;                   // offset: 06D2, size: 0002
  unsigned __int16 m_wApplyEffectChanceLimitToPlayer;                      // offset: 06D4, size: 0002
  unsigned __int16 m_bf1IsApplyMinDamageWhenBeNotLightEffect : 1;          // offset: 06D6, size: 0000
  unsigned __int16 m_bf1IsApplyExplosionWhenHitTargetStickedBit : 1;       // offset: 06D6, size: 0000
  unsigned __int16 m_bf1IsApplySameTarget : 1;                             // offset: 06D6, size: 0000
  unsigned __int16 m_bf11ArcHeight : 11;                                   // offset: 06D6, size: 0001
  unsigned __int16 m_bf1IsAbleSkillWhenTransToWeapon : 1;                  // offset: 06D7, size: 0000
  unsigned __int16 m_bf1IsApplySurvivalInstinctWhenHitRangeSkill : 1;      // offset: 06D7, size: 0000
  __int16 m_sAttackPointPerActorLevel;                                     // offset: 06D8, size: 0002
  __int16 m_sAddDamagePercent;                                             // offset: 06DA, size: 0002
  unsigned __int16 m_bf5MagicDamageDiceCount : 5;                          // offset: 06DC, size: 0000
  unsigned __int16 m_bf5MagicDamageDiceCountLimit : 5;                     // offset: 06DC, size: 0000
  __int16 m_sMagicDamageDiceCountPerLevel;                                 // offset: 06DE, size: 0002
  unsigned __int8 m_abSpareSkillBuffer[12];                                // offset: 06E0, size: 000C
  char m_strComment[256];                                                  // offset: 06EC, size: 0100
  char m_strPowerup[64];                                                   // offset: 07EC, size: 0040
};                                                                         
