struct __cppobj __unaligned __declspec(align(2)) CBasicItemData               // size: 01AA
{
  int m_iSerial;                                                              // offset: 0000, size: 0004
  char m_strName[50];                                                         // offset: 0004, size: 0032
  char m_strOwnerGuild[18];                                                   // offset: 0036, size: 0012
  unsigned int m_dwCommentAddress;                                            // offset: 0048, size: 0004
  unsigned __int16 m_wKind;                                                   // offset: 004C, size: 0002
  unsigned __int8 m_aEnableJob[18];                                           // offset: 004E, size: 0012
  unsigned int m_dwPrice;                                                     // offset: 0060, size: 0004
  unsigned __int16 m_wPriceComputeMethod;                                     // offset: 0064, size: 0002
  unsigned __int16 m_wRange;                                                  // offset: 0066, size: 0002
  unsigned __int16 m_wDamageRange;                                            // offset: 0068, size: 0002
  unsigned __int16 m_wSpeed;                                                  // offset: 006A, size: 0002
  unsigned __int16 m_wMinDamage;                                              // offset: 006C, size: 0002
  unsigned __int16 m_wMaxDamage;                                              // offset: 006E, size: 0002
  unsigned __int16 m_wDurability;                                             // offset: 0070, size: 0002
  unsigned __int16 m_wEquipUseLimitValue;                                     // offset: 0072, size: 0002
  unsigned __int16 m_wEquipUseLimitContents;                                  // offset: 0074, size: 0002
  unsigned __int16 m_wEquipUseLimitMethod;                                    // offset: 0076, size: 0002
  unsigned __int16 m_wRequireLevel;                                           // offset: 0078, size: 0002
  unsigned __int16 m_wRequireStrength;                                        // offset: 007A, size: 0002
  unsigned __int16 m_wRequireDexterity;                                       // offset: 007C, size: 0002
  unsigned __int16 m_wRequireConstitution;                                    // offset: 007E, size: 0002
  unsigned __int16 m_wRequireWisdom;                                          // offset: 0080, size: 0002
  unsigned __int16 m_wRequireIntelligence;                                    // offset: 0082, size: 0002
  unsigned __int16 m_wRequireCharisma;                                        // offset: 0084, size: 0002
  unsigned __int16 m_wRequireLuck;                                            // offset: 0086, size: 0002
  unsigned __int16 m_wRequireAllignment;                                      // offset: 0088, size: 0002
  unsigned __int16 m_wIconShape;                                              // offset: 008A, size: 0002
  unsigned __int16 m_wFieldShape;                                             // offset: 008C, size: 0002
  unsigned __int16 m_wEquippedShape;                                          // offset: 008E, size: 0002
  unsigned __int16 m_questKind : 2;                                           // offset: 0090, size: 0000
  unsigned __int16 m_questIndex : 14;                                         // offset: 0090, size: 0001
  unsigned __int16 m_wStackLimit;                                             // offset: 0092, size: 0002
  unsigned __int16 m_wDropLevel;                                              // offset: 0094, size: 0002
  unsigned __int16 m_aValue[2][2];                                            // offset: 0096, size: 0008
  cITEM_GENERATE_DATA m_aGenerateData[4];                                     // offset: 009E, size: 0028
  cUniqueData m_aUniqueData[6];                                               // offset: 00C6, size: 006C
  unsigned __int16 m_wPriceValue;                                             // offset: 0132, size: 0002
  tsBasicItemAttribute m_attr;                                                // offset: 0134, size: 0004
  unsigned __int16 m_wExpireYear;                                             // offset: 0138, size: 0002
  unsigned __int16 m_wExpireMonth;                                            // offset: 013A, size: 0002
  unsigned __int16 m_wExpireDay;                                              // offset: 013C, size: 0002
  unsigned __int16 m_wExpireHour;                                             // offset: 013E, size: 0002
  unsigned __int16 m_wEnchantMinChance;                                       // offset: 0140, size: 0002
  unsigned __int16 m_wEnchantMaxChance;                                       // offset: 0142, size: 0002
  unsigned __int16 m_wEnchantLimitPrefixDiscernmentCode;                      // offset: 0144, size: 0002
  unsigned __int16 m_wPaletteIndex;                                           // offset: 0146, size: 0002
  unsigned __int16 m_wBoostDurability;                                        // offset: 0148, size: 0002
  unsigned __int16 m_wCorrectDropChance;                                      // offset: 014A, size: 0002
  unsigned __int16 m_wBaseItem;                                               // offset: 014C, size: 0002
  unsigned __int16 m_wExtraGrade;                                             // offset: 014E, size: 0002
  unsigned __int16 m_wPremiumLevel;                                           // offset: 0150, size: 0002
  unsigned __int16 m_wIsIDPublicItem;                                         // offset: 0152, size: 0002
  unsigned __int32 m_bf1IsDestroyWhenMoveField : 1;                           // offset: 0154, size: 0000
  unsigned __int32 m_bf1IsBuyOnlyGuildMaster : 1;                             // offset: 0154, size: 0000
  unsigned __int32 m_bf1IsUseOnlyGuildMaster : 1;                             // offset: 0154, size: 0000
  unsigned __int32 m_bf1IsUseAbleByThrowPotionSkill : 1;                      // offset: 0154, size: 0000
  unsigned __int32 m_bf1IsUseAbleByThrowFlowerSkill : 1;                      // offset: 0154, size: 0000
  unsigned __int32 m_bf1IsUseAbleByThrowDrugSkill : 1;                        // offset: 0154, size: 0000
  unsigned __int32 m_bf1IsUseAbleByThrowCandySkill : 1;                       // offset: 0154, size: 0000
  unsigned __int32 m_bf1IsUltimate : 1;                                       // offset: 0154, size: 0000
  unsigned __int32 m_bf1IsBlockToEnchant : 1;                                 // offset: 0155, size: 0000
  unsigned __int32 m_bf1IsBlockToFeedPet : 1;                                 // offset: 0155, size: 0000
  unsigned __int32 m_bf1IsFreeTeleport : 1;                                   // offset: 0155, size: 0000
  unsigned __int32 m_bf1IsRequestSummonCarpet : 1;                            // offset: 0155, size: 0000
  unsigned __int32 m_bf1IsCanSummonMagicCarpet : 1;                           // offset: 0155, size: 0000
  unsigned __int32 m_bf1RemeberPlace0 : 1;                                    // offset: 0155, size: 0000
  unsigned __int32 m_bf1RemeberPlace1 : 1;                                    // offset: 0155, size: 0000
  unsigned __int32 m_bf1RemeberPlace2 : 1;                                    // offset: 0155, size: 0000
  unsigned __int32 m_bf1AddEntryGuildDungeon : 1;                             // offset: 0156, size: 0000
  unsigned __int32 m_bf1IsAddGetMysticStone : 1;                              // offset: 0156, size: 0000
  unsigned __int32 m_bf1IsAddGetTantalissRelic : 1;                           // offset: 0156, size: 0000
  unsigned __int32 m_bf1IsIgnoreGuildHallLevelForEntryTantalisExile : 1;      // offset: 0156, size: 0000
  unsigned __int32 m_bf1IsInfinitySeriousUpgradeChanceUp : 1;                 // offset: 0156, size: 0000
  unsigned __int32 m_bf1IsRequireLogWithGuildInfo : 1;                        // offset: 0156, size: 0000
  unsigned __int32 m_bf1IsFreePastPortal : 1;                                 // offset: 0156, size: 0000
  unsigned __int32 m_bf1IsHalfPastPortal : 1;                                 // offset: 0156, size: 0000
  unsigned __int32 m_bf1IsExcludeExpBonus : 1;                                // offset: 0157, size: 0000
  unsigned __int32 m_bf3WearLimit : 3;                                        // offset: 0157, size: 0000
  unsigned __int32 m_bf1IsEternalItem : 1;                                    // offset: 0157, size: 0000
  unsigned __int32 m_bf1EternalItemUpgradeNotPenalty : 1;                     // offset: 0157, size: 0000
  unsigned __int32 m_bf1IsUpgradeMaterials : 1;                               // offset: 0157, size: 0000
  unsigned __int32 m_bf1IsItemNotUsePet : 1;                                  // offset: 0157, size: 0000
  int m_bIsExceptionItem;                                                     // offset: 0158, size: 0004
  unsigned __int16 m_wPremiumItemLevelForWithdraw;                            // offset: 015C, size: 0002
  unsigned __int8 m_bCompulsionColorizeEffect;                                // offset: 015E, size: 0001
  unsigned __int8 m_bCoolTimeIndex;                                           // offset: 015F, size: 0001
  unsigned __int16 m_wCoolTimeSecond;                                         // offset: 0160, size: 0002
  unsigned __int16 m_wNextEternalItemSerial;                                  // offset: 0162, size: 0002
  unsigned __int16 m_bf4EternalItemCurrentLevel : 4;                          // offset: 0164, size: 0000
  unsigned __int16 m_bf1IsMaleJobEquipAble : 1;                               // offset: 0164, size: 0000
  unsigned __int16 m_bf1IsFemaleJobEquipAble : 1;                             // offset: 0164, size: 0000
  unsigned __int16 m_bf7UpgradeBaseSuccessPercent : 7;                        // offset: 0164, size: 0000
  unsigned __int16 m_bf1IsOccurEatPotionEffect : 1;                           // offset: 0165, size: 0000
  unsigned __int16 m_bf1IsUseShop : 1;                                        // offset: 0165, size: 0000
  unsigned __int16 m_bf1IsUseBank : 1;                                        // offset: 0165, size: 0000
  unsigned int m_uiEquipAbleJobMask;                                          // offset: 0166, size: 0004
  unsigned __int16 m_wUpgradePenaltyItemSerial;                               // offset: 016A, size: 0002
  unsigned __int16 m_bf7UpgradeMaterialsSuccessPercent : 7;                   // offset: 016C, size: 0000
  unsigned __int16 m_bf7UpgradeCosmicPowerSuccessPercent : 7;                 // offset: 016C, size: 0000
  unsigned __int16 m_bf1IsNotConsume : 1;                                     // offset: 016D, size: 0000
  unsigned __int16 m_bf1IsUseItemAfterTransformation : 1;                     // offset: 016D, size: 0000
  unsigned __int16 m_bf4ItemRebirthCount : 4;                                 // offset: 016E, size: 0000
  unsigned __int16 m_bf5LimitUpgradeRingOfInfinity : 5;                       // offset: 016E, size: 0000
  unsigned __int16 m_bf1IsRingOfInfinity : 1;                                 // offset: 016F, size: 0000
  unsigned __int16 m_bf1IsUseToEnemy : 1;                                     // offset: 016F, size: 0000
  unsigned __int16 m_bf1IsUseAfterWear : 1;                                   // offset: 016F, size: 0000
  unsigned __int16 m_bf1IsUsePremiumInventory : 1;                            // offset: 016F, size: 0000
  unsigned __int16 m_bf1IsNotApplyCopyEffect : 1;                             // offset: 016F, size: 0000
  unsigned __int16 m_bf1IsNotApplyReversionEffect : 1;                        // offset: 016F, size: 0000
  unsigned __int16 m_bf1IsNotGetUsedSkill : 1;                                // offset: 016F, size: 0000
  unsigned __int16 m_wMoveFieldSerial;                                        // offset: 0170, size: 0002
  unsigned __int16 m_wRequireMaxLevel;                                        // offset: 0172, size: 0002
  unsigned __int16 m_wItemEffect;                                             // offset: 0174, size: 0002
  unsigned __int16 m_bf1IsNotUseToGVG : 1;                                    // offset: 0176, size: 0000
  unsigned __int8 m_aDummyData[50];                                           // offset: 0178, size: 0032
};
