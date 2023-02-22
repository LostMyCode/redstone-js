// SDHEADER exported from Bada
struct __declspec(align(4)) $F8463B97287BEE435BC1537A8DAD96E9 // size: 0x40
{
  int Size;                       // offset: 0x00, size: 0x04
  char Reg[50];                   // offset: 0x04, size: 0x32
  unsigned __int8 BPP;            // offset: 0x36, size: 0x01
  unsigned __int16 ImageCount;    // offset: 0x38, size: 0x02
  unsigned __int8 Alpha;          // offset: 0x3A, size: 0x01
  unsigned __int8 bOutline;       // offset: 0x3B, size: 0x01
  unsigned __int8 bShadow;        // offset: 0x3C, size: 0x01
};

// SDHEADER exported from Object Editor
struct __declspec(align(4)) _tsSDHEADER // size: 0x40
{
  int Size;                             // offset: 0x00, size: 0x04
  char Reg[40];                         // offset: 0x04, size: 0x28
  unsigned __int16 m_wMaxSpriteWidth;   // offset: 0x2C, size: 0x02
  unsigned __int16 m_wMaxSpriteHeight;  // offset: 0x2E, size: 0x02
  unsigned __int16 m_wMaxShadowWidth;   // offset: 0x30, size: 0x02
  unsigned __int16 m_wMaxShadowHeight;  // offset: 0x32, size: 0x02
  char buffer[2];                       // offset: 0x34, size: 0x02
  unsigned __int8 BPP;                  // offset: 0x36, size: 0x01
  unsigned __int16 ImageCount;          // offset: 0x38, size: 0x02
  unsigned __int8 Alpha;                // offset: 0x3A, size: 0x01
  unsigned __int8 bOutline;             // offset: 0x3B, size: 0x01
  unsigned __int8 bShadow;              // offset: 0x3C, size: 0x01
};
