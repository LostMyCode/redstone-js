export const MINIPET_ACT_READY = 0;
export const MINIPET_ACT_MOVE = 1;
export const MINIPET_ACT_ACTION = 2;
export const MINIPET_ACT_SUMMON = 3;
export const MINIPET_ACT_RELEASE = 4;


// Common animation classification
export const ACT_WALK = 0; // Walk.
export const ACT_RUN = 1; // Run.
export const ACT_READY = 2; // Stop (in combat)
export const ACT_HIT = 3; // Hit.
export const ACT_CHANGE1 = 4; // Change weapon
export const ACT_CHANGE2 = 5; // Switch weapon
export const ACT_DEAD = 6; // Dead
export const ACT_SITDOWN = 7; // Sit down
export const ACT_ACTION_1 = 8; // Action 1
export const ACT_ACTION_2 = 9; // Action 2
export const ACT_ACTION_3 = 10; // Action 3
export const ACT_ACTION_4 = 11; // Action 4
export const ACT_ACTION_5 = 12; // Action 5
export const ACT_ACTION_6 = 13; // Action 6
export const ACT_ACTION_7 = 14; // Action 7
export const ACT_ACTION_8 = 15; // Action 8
export const ACT_ACTION_9 = 16; // Action 9
export const ACT_ACTION_10 = 17; // Action 10
export const ACT_ACTION_11 = 18; // Action 11
export const ACT_ACTION_12 = 19; // Action 12
export const ACT_ACTION_13 = 20; // Action 13
export const ACT_ACTION_14 = 21; // Action 14
export const ACT_ACTION_15 = 22; // Action 15
export const ACT_ACTION_16 = 23; // Action 16


export const ACT_RIDE_DOG_MOVE = 12; // Ride and move the dog
export const ACT_RIDE_DOG_READY = 13; // Dog ride ready
export const ACT_RIDE_DOG_ATTACK = 14; // Attack the dog.


export const ACT_MONSTER_BLOCKING = 16; // Action 9


export const ACT_RIDE_DOG_ACTION_COUNT = 3; // Dog ride action count
export const ACT_PRINCE_JUMPING_SKIPPING = 18; // Number of jumping actions


export const BlockingAction = [
    13, 17,
    ACT_HIT, ACT_HIT,
    12, ACT_HIT,
    23, 23,
    14, ACT_HIT,
    ACT_HIT, ACT_HIT,
    ACT_HIT, ACT_HIT,
    ACT_HIT, ACT_HIT,
];

export const ACT_DEFAULT_ATTACK = 100; // Default attack action
export const ACT_DEFAULT_MAGIC = 101; // Default magic action

export const ACT_BLOCKER = 19;

export const DIRECT_N = 0;
export const DIRECT_NE = 1;
export const DIRECT_E = 2;
export const DIRECT_SE = 3;
export const DIRECT_S = 4;
export const DIRECT_SW = 5;
export const DIRECT_W = 6;
export const DIRECT_NW = 7;

export const GetDirect = (_iAngle, _iDirectCount) => {
    if (_iDirectCount == 0)
        return 0;

    _iAngle = _iAngle + 360 / _iDirectCount / 2;

    if (_iAngle >= 360) _iAngle -= 360;
    _iAngle = _iAngle * _iDirectCount / 360;

    if (_iAngle <= _iDirectCount / 4) return Math.floor(_iDirectCount / 4 - _iAngle);

    return Math.floor(_iDirectCount - (_iAngle - _iDirectCount / 4));
}
