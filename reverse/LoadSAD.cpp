int __cdecl cANM::LoadSAD(char *file, int a2, HWND a3)
{
  _iobuf *v3; // eax
  _iobuf *v4; // esi
  void *v6; // edi
  int v7; // ebp
  void *v8; // ebx
  int v9; // ebp
  void *v10; // ebx
  int i; // ebp
  int v12; // ebx
  int v13; // ecx
  int j; // ebx
  signed int v15; // ebp
  int v16; // ecx
  int v17; // ecx
  int *v18; // ebp
  unsigned int *v19; // ebx
  bool v20; // cc
  int *v21; // edi
  signed int v22; // ebx
  int *v23; // edi
  cSTRINGS *v24; // edi
  cSTRINGS *v25; // eax
  cSTRINGS *v26; // eax
  int v27; // edi
  unsigned __int8 *v28; // [esp+14h] [ebp-70h]
  unsigned __int8 *v29; // [esp+14h] [ebp-70h]
  unsigned __int8 *v30; // [esp+14h] [ebp-70h]
  unsigned __int8 *v31; // [esp+14h] [ebp-70h]
  unsigned __int8 *v32; // [esp+14h] [ebp-70h]
  unsigned __int8 *v33; // [esp+14h] [ebp-70h]
  cIMG *v34; // [esp+18h] [ebp-6Ch] BYREF
  cSTRINGS *v35; // [esp+1Ch] [ebp-68h]
  LPCSTR lpString; // [esp+20h] [ebp-64h]
  HWND hWnd; // [esp+24h] [ebp-60h]
  __int16 v38[4]; // [esp+28h] [ebp-5Ch] BYREF
  char buffer[4]; // [esp+30h] [ebp-54h] BYREF
  char format[64]; // [esp+34h] [ebp-50h] BYREF
  int v41; // [esp+80h] [ebp-4h]

  lpString = file;
  hWnd = a3;
  v3 = fopen(file, "rb");
  v4 = v3;
  if ( !v3 )
    return cMSG::Put(&byte_4602BC, aS_4, file);
  fseek(v3, 50, 0);
  fread(buffer, 4u, 1u, v4);
  fseek(v4, 0, 0);
  fread(&SADHEADER, 0x40u, 1u, v4);
  if ( strcmp(byte_4783AC, regSADHEADER) && strcmp(byte_4783AC, regSADHEADER2) )
    return cMSG::Put(&byte_460290, aS_3, file);
  cANM::AnmType = (unsigned __int8)byte_4783E2;
  cANM::bHALF = byte_4783E6;
  cANM::bSAVEOUTLINE = byte_4783E4;
  cANM::AnmCount = (unsigned __int16)word_4783DE;
  cANM::bSAVESHADOW = byte_4783E5;
  cANM::BPP = (unsigned __int8)byte_4783E7;
  if ( byte_4783E7 == 8 )
    fread(&cANM::PLT, 0x100u, 2u, v4);
  cIMG::Reset();
  v6 = operator new(4 * ((unsigned __int16)word_4783E0 + 1));
  fread(v6, 4u, (unsigned __int16)word_4783E0 + 1, v4);
  if ( byte_4783E7 != 8 )
    goto LABEL_11;
  v7 = 0;
  if ( word_4783E0 )
  {
    do
    {
      v8 = operator new(*((_DWORD *)v6 + v7 + 1) - *((_DWORD *)v6 + v7));
      fread(v8, *((_DWORD *)v6 + v7 + 1) - *((_DWORD *)v6 + v7), 1u, v4);
      cIMG::Add((unsigned __int8 *)v8, *((_DWORD *)v6 + v7 + 1) - *((_DWORD *)v6 + v7));
      ++v7;
    }
    while ( v7 < (unsigned __int16)word_4783E0 );
LABEL_11:
    if ( byte_4783E7 == 16 )
    {
      v9 = 0;
      if ( word_4783E0 )
      {
        do
        {
          v10 = operator new(2 * (*((_DWORD *)v6 + v9 + 1) - *((_DWORD *)v6 + v9)));
          fread(v10, *((_DWORD *)v6 + v9 + 1) - *((_DWORD *)v6 + v9), 2u, v4);
          cIMG::Add((unsigned __int16 *)v10, *((_DWORD *)v6 + v9 + 1) - *((_DWORD *)v6 + v9));
          ++v9;
        }
        while ( v9 < (unsigned __int16)word_4783E0 );
      }
    }
  }
  if ( cANM::bSAVESHADOW )
  {
    v34 = (cIMG *)*((_DWORD *)cIMG::pHEAD + 2);
    fread(v6, 4u, (unsigned __int16)word_4783E0 + 1, v4);
    for ( i = 0; i < cIMG::Count; v34 = *(cIMG **)(v13 + 8) )
    {
      v12 = *((_DWORD *)v6 + i + 1) - *((_DWORD *)v6 + i);
      v28 = 0;
      if ( v12 > 0 )
      {
        v28 = (unsigned __int8 *)operator new(v12);
        fread(v28, 1u, v12, v4);
      }
      cIMG::SetShadow(v34, v28, v12);
      ++i;
    }
  }
  v34 = (cIMG *)*((_DWORD *)cIMG::pHEAD + 2);
  fread(v6, 4u, (unsigned __int16)word_4783E0 + 1, v4);
  for ( j = 0; j < cIMG::Count; v34 = *(cIMG **)(v16 + 8) )
  {
    v15 = *((_DWORD *)v6 + j + 1) - *((_DWORD *)v6 + j);
    v29 = 0;
    if ( v15 > 0 )
    {
      v29 = (unsigned __int8 *)operator new(v15);
      fread(v29, 1u, v15, v4);
    }
    cIMG::SetLayer(v34, v29, *((_DWORD *)v6 + j + 1) - *((_DWORD *)v6 + j));
    ++j;
  }
  cANM::SetAnmType(cANM::AnmType);
  fread(&MoveOval, 4u, 1u, v4);
  fread(&CRASHBOX, 0x10u, 1u, v4);
  if ( (unsigned __int8)byte_4783E3 >= 0x65u )
    fread(&g_rectSelect, 0x10u, 1u, v4);
  fread(&g_wAnmDataType, 2u, 1u, v4);
  fread(&g_wPartsType, 2u, 1u, v4);
  fread(v38, 1u, 8u, v4);
  word_4B8682 = v38[0];
  word_4B8684 = v38[2];
  fread(&g_wCrashSize, 2u, 1u, v4);
  fread(&g_wPlayerJob, 2u, 1u, v4);
  if ( g_wPlayerJob )
    cMAIN::loadPlayerLayerData((cMAIN *)&_MAIN, 0);
  v17 = 0xFFFF;
  if ( (unsigned __int8)byte_4783E3 < 0x64u || (unsigned __int8)byte_4783E3 > l_iVersion )
  {
    cANM::s_iDefaultAttack = 0xFFFF;
  }
  else
  {
    fread(&cANM::s_iDefaultAttack, 4u, 1u, v4);
    fread(&v34, 2u, 1u, v4);
    fread(&cANM::s_wIsOccasionallyRestAction, 2u, 1u, v4);
    v17 = (unsigned __int16)v34;
  }
  cANM::s_iDefaultMagic = v17;
  v35 = 0;
  if ( (int)cANM::AnmCount > 0 )
  {
    v18 = &dword_4B87A4;
    do
    {
      v19 = (unsigned int *)(v18 - 3);
      fread(v18 - 3, 4u, 1u, v4);
      v20 = *(v18 - 3) <= 0;
      *v18 = 0;
      if ( !v20 )
      {
        fread(v18, 4u, 1u, v4);
        v21 = v18 - 2;
        fread(v18 - 2, 4u, 1u, v4);
        fread(v18 - 4, 4u, 1u, v4);
        fread(v18 - 6, 4u, 1u, v4);
        fread(v18 - 5, 4u, 1u, v4);
        fread(v18 - 8, 4u, 1u, v4);
        fread(v18 - 7, 4u, 1u, v4);
        fread(v18 - 1, 4u, 1u, v4);
        if ( *(v18 - 1) >= (int)cANM::AnmCount )
          *(v18 - 1) = 0xFFFF;
        fread(v18 + 49153, *v19, 1u, v4);
        v20 = *v21 <= 0;
        v34 = 0;
        if ( !v20 )
        {
          v30 = (unsigned __int8 *)(v18 + 1);
          do
          {
            fread(v30, 2 * *v19, 1u, v4);
            v30 += 2048;
            v20 = (int)v34 + 1 < *v21;
            v34 = (cIMG *)((char *)v34 + 1);
          }
          while ( v20 );
        }
        v20 = *v21 <= 0;
        v34 = 0;
        if ( !v20 )
        {
          v31 = (unsigned __int8 *)(v18 + 32769);
          do
          {
            fread(v31, *v19, 1u, v4);
            v31 += 1024;
            v20 = (int)v34 + 1 < *v21;
            v34 = (cIMG *)((char *)v34 + 1);
          }
          while ( v20 );
        }
        if ( *(v18 - 8) )
        {
          v20 = *v21 <= 0;
          v34 = 0;
          if ( !v20 )
          {
            v32 = (unsigned __int8 *)v18 - 546;
            do
            {
              fread(v32, 4u, 1u, v4);
              v32 += 4;
              v20 = (int)v34 + 1 < *v21;
              v34 = (cIMG *)((char *)v34 + 1);
            }
            while ( v20 );
          }
        }
        if ( *(v18 - 7) )
        {
          v20 = *v21 <= 0;
          v34 = 0;
          if ( !v20 )
          {
            v33 = (unsigned __int8 *)v18 - 262690;
            do
            {
              fread(v33, 4 * *v19, 1u, v4);
              v33 += 4096;
              v20 = (int)v34 + 1 < *v21;
              v34 = (cIMG *)((char *)v34 + 1);
            }
            while ( v20 );
          }
        }
      }
      v18 += 115094;
      v35 = (cSTRINGS *)((char *)v35 + 1);
    }
    while ( (int)v35 < (int)cANM::AnmCount );
  }
  fread(&cANM::ANMName, 0x28u, 1u, v4);
  fread(&cANM::bHALF, 1u, 1u, v4);
  fread(&cANM::bSAVEOUTLINE, 1u, 1u, v4);
  fread(&cANM::bSAVESHADOW, 1u, 1u, v4);
  fread(&cANM::AnmType, 4u, 1u, v4);
  fread(&cANM::AnmCount, 4u, 1u, v4);
  v22 = 0;
  if ( (int)cANM::AnmCount > 0 )
  {
    v23 = &dword_4B87A4;
    do
    {
      fread(v23 - 65685, 0x28u, 1u, v4);
      fread(v23, 4u, 1u, v4);
      fread(v23 - 2, 4u, 1u, v4);
      fread(v23 - 3, 4u, 1u, v4);
      fread(v23 - 8, 4u, 1u, v4);
      fread(v23 - 7, 4u, 1u, v4);
      ++v22;
      v23 += 115094;
    }
    while ( v22 < (int)cANM::AnmCount );
  }
  fread(&ImageFolderCount, 4u, 1u, v4);
  fread(&ImageFolder, 4 * ImageFolderCount + 8, 1u, v4);
  if ( imageFOLDERS )
  {
    v24 = imageFOLDERS;
    cSTRINGS::~cSTRINGS(imageFOLDERS);
    operator delete(v24);
    imageFOLDERS = 0;
  }
  v25 = (cSTRINGS *)operator new(0x14u);
  v35 = v25;
  v41 = 0;
  if ( v25 )
    v26 = cSTRINGS::cSTRINGS(v25, 0xFFFF);
  else
    v26 = 0;
  v27 = 0;
  v41 = -1;
  for ( imageFOLDERS = v26; v27 < ImageFolderCount; ++v27 )
  {
    fread(format, 0x40u, 1u, v4);
    cSTRINGS::Add(imageFOLDERS, format, 0);
  }
  fclose(v4);
  bVIRGIN = 1;
  cANM::CurAnm = 0;
  cANM::CurFrame = 0;
  cANM::CurDirect = 0;
  if ( dword_31953EC == 1 )
  {
    cANM::SetCurrentFrame(0xFFFF, 0xFFFF, 0xFFFF);
  }
  else if ( cIMG::Count > 0 )
  {
    cIMG::Current = 0;
    cIMG::pCURRENT = cIMG::Get(0);
    *((_DWORD *)cIMG::pCURRENT + 16) = 1;
    cIMG::ClearSelect();
  }
  else
  {
    cIMG::pCURRENT = 0;
  }
  cANM::CorrectEventFrame();
  SetWindowTextA(hWnd, lpString);
  return 1;
}
