int __cdecl cANM::SaveSAD(char *file, int a2)
{
  _iobuf *v2; // ebp
  int v4; // esi
  int v5; // edi
  int v6; // eax
  int v7; // esi
  int v8; // edi
  int v9; // edi
  int v10; // ebx
  int v11; // esi
  int v12; // edi
  int v13; // eax
  int v14; // esi
  int v15; // edi
  int v16; // esi
  int v17; // edi
  int v18; // eax
  int v19; // esi
  int v20; // edi
  unsigned int v21; // ebx
  const char *v22; // esi
  int *v23; // ebx
  unsigned int *v24; // esi
  int *v25; // edi
  bool v26; // cc
  signed int v27; // eax
  signed int v28; // edi
  int *v29; // esi
  int i; // ebx
  char *Str; // eax
  char *v32; // edx
  char v33; // cl
  char *v34; // eax
  int v35; // edx
  char v36; // cl
  int buffer; // [esp+18h] [ebp-64h] BYREF
  void *v38; // [esp+1Ch] [ebp-60h]
  int v39; // [esp+20h] [ebp-5Ch]
  int v40; // [esp+24h] [ebp-58h] BYREF
  _WORD *v41; // [esp+28h] [ebp-54h]
  unsigned int v42; // [esp+2Ch] [ebp-50h] BYREF
  int v43[2]; // [esp+30h] [ebp-4Ch] BYREF
  char v44[64]; // [esp+38h] [ebp-44h] BYREF

  v38 = file;
  cANM::CorrectEventFrame();
  v2 = fopen(file, "wb");
  if ( !v2 )
  {
    fclose(0);
    v2 = fopen(file, "wb");
    if ( !v2 )
      return cMSG::Put(&byte_460268, aS_8, file);
  }
  fseek(v2, 64, 0);
  if ( cANM::BPP == 8 )
    fwrite(&cANM::PLT, 0x200u, 1u, v2);
  v4 = *((_DWORD *)cIMG::pHEAD + 2);
  v5 = 0;
  buffer = 0;
  fwrite(&buffer, 4u, 1u, v2);
  v6 = cIMG::Count;
  if ( cIMG::Count > 0 )
  {
    do
    {
      buffer += *(_DWORD *)(v4 + 32);
      fwrite(&buffer, 4u, 1u, v2);
      v6 = cIMG::Count;
      v4 = *(_DWORD *)(v4 + 8);
      ++v5;
    }
    while ( v5 < cIMG::Count );
  }
  v7 = *((_DWORD *)cIMG::pHEAD + 2);
  if ( cANM::BPP != 8 )
    goto LABEL_11;
  v8 = 0;
  if ( v6 > 0 )
  {
    do
    {
      fwrite(*(const void **)(v7 + 28), *(_DWORD *)(v7 + 32), 1u, v2);
      v6 = cIMG::Count;
      v7 = *(_DWORD *)(v7 + 8);
      ++v8;
    }
    while ( v8 < cIMG::Count );
LABEL_11:
    if ( cANM::BPP == 16 )
    {
      v9 = 0;
      if ( v6 > 0 )
      {
        do
        {
          fwrite(*(const void **)(v7 + 16), *(_DWORD *)(v7 + 32), 2u, v2);
          v7 = *(_DWORD *)(v7 + 8);
          ++v9;
        }
        while ( v9 < cIMG::Count );
      }
      buffer *= 2;
    }
  }
  ftell(v2);
  if ( a2 )
    cMSG::Output("%s File's Image  Size : %-6.4f kilo byte", file, (double)buffer * 0.0009765625);
  v10 = buffer;
  if ( cANM::BPP == 16 )
    v10 = 2 * buffer;
  if ( cANM::bSAVESHADOW )
  {
    v11 = *((_DWORD *)cIMG::pHEAD + 2);
    v12 = 0;
    buffer = 0;
    fwrite(&buffer, 4u, 1u, v2);
    v13 = cIMG::Count;
    if ( cIMG::Count > 0 )
    {
      do
      {
        buffer += *(_DWORD *)(v11 + 36);
        fwrite(&buffer, 4u, 1u, v2);
        v13 = cIMG::Count;
        v11 = *(_DWORD *)(v11 + 8);
        ++v12;
      }
      while ( v12 < cIMG::Count );
    }
    v14 = *((_DWORD *)cIMG::pHEAD + 2);
    v15 = 0;
    if ( v13 > 0 )
    {
      do
      {
        fwrite(*(const void **)(v14 + 20), *(_DWORD *)(v14 + 36), 1u, v2);
        v14 = *(_DWORD *)(v14 + 8);
        ++v15;
      }
      while ( v15 < cIMG::Count );
    }
    v10 += buffer;
    if ( a2 )
      cMSG::Output("%s File's Shadow Size : %-6.4f kilo byte", (const char *)v38, (double)buffer * 0.0009765625);
  }
  v16 = *((_DWORD *)cIMG::pHEAD + 2);
  v17 = 0;
  buffer = 0;
  fwrite(&buffer, 4u, 1u, v2);
  v18 = cIMG::Count;
  if ( cIMG::Count > 0 )
  {
    do
    {
      buffer += *(_DWORD *)(v16 + 40);
      fwrite(&buffer, 4u, 1u, v2);
      v18 = cIMG::Count;
      v16 = *(_DWORD *)(v16 + 8);
      ++v17;
    }
    while ( v17 < cIMG::Count );
  }
  v19 = *((_DWORD *)cIMG::pHEAD + 2);
  v20 = 0;
  if ( v18 > 0 )
  {
    do
    {
      fwrite(*(const void **)(v19 + 24), *(_DWORD *)(v19 + 40), 1u, v2);
      v19 = *(_DWORD *)(v19 + 8);
      ++v20;
    }
    while ( v20 < cIMG::Count );
  }
  v21 = buffer + v10;
  if ( a2 )
  {
    v22 = (const char *)v38;
    cMSG::Output("%s File's Layer  Size : %-6.4f kilo byte", (const char *)v38, (double)buffer * 0.0009765625);
    v42 = v21;
    cMSG::Output("%s File's Total  Size : %-6.4f kilo byte", v22, (double)v21 * 0.0009765625);
  }
  fwrite(&MoveOval, 4u, 1u, v2);
  fwrite(&CRASHBOX, 0x10u, 1u, v2);
  fwrite(&g_rectSelect, 0x10u, 1u, v2);
  fwrite(&g_wAnmDataType, 2u, 1u, v2);
  fwrite(&g_wPartsType, 2u, 1u, v2);
  v43[0] = word_4B8682;
  v43[1] = word_4B8684;
  fwrite(v43, 1u, 8u, v2);
  fwrite(&g_wCrashSize, 2u, 1u, v2);
  fwrite(&g_wPlayerJob, 2u, 1u, v2);
  fwrite(&cANM::s_iDefaultAttack, 4u, 1u, v2);
  v40 = (unsigned __int16)cANM::s_iDefaultMagic;
  fwrite(&v40, 2u, 1u, v2);
  fwrite(&cANM::s_wIsOccasionallyRestAction, 2u, 1u, v2);
  v40 = 0;
  if ( (int)cANM::AnmCount > 0 )
  {
    v23 = &dword_4B87A4;
    do
    {
      v24 = (unsigned int *)(v23 - 3);
      fwrite(v23 - 3, 4u, 1u, v2);
      if ( *(v23 - 3) > 0 )
      {
        v42 = *(v23 - 4);
        fwrite(v23, 4u, 1u, v2);
        v25 = v23 - 2;
        fwrite(v23 - 2, 4u, 1u, v2);
        fwrite(&v42, 4u, 1u, v2);
        fwrite(v23 - 6, 4u, 1u, v2);
        fwrite(v23 - 5, 4u, 1u, v2);
        fwrite(v23 - 8, 4u, 1u, v2);
        fwrite(v23 - 7, 4u, 1u, v2);
        fwrite(v23 - 1, 4u, 1u, v2);
        fwrite(v23 + 49153, *v24, 1u, v2);
        v26 = *(v23 - 2) <= 0;
        v39 = 0;
        if ( !v26 )
        {
          v38 = v23 + 1;
          do
          {
            v27 = 0;
            if ( (int)*v24 > 0 )
            {
              v41 = v38;
              do
              {
                if ( (unsigned __int16)*v41 >= cIMG::Count )
                  *v41 = 0;
                ++v41;
                ++v27;
              }
              while ( v27 < (int)*v24 );
            }
            fwrite(v38, 2 * *v24, 1u, v2);
            v38 = (char *)v38 + 2048;
            v26 = ++v39 < *v25;
          }
          while ( v26 );
        }
        v26 = *v25 <= 0;
        v39 = 0;
        if ( !v26 )
        {
          v38 = v23 + 32769;
          do
          {
            fwrite(v38, *v24, 1u, v2);
            v38 = (char *)v38 + 1024;
            v26 = ++v39 < *v25;
          }
          while ( v26 );
        }
        if ( *(v23 - 8) )
        {
          v26 = *v25 <= 0;
          v39 = 0;
          if ( !v26 )
          {
            v38 = (char *)v23 - 546;
            do
            {
              fwrite(v38, 4u, 1u, v2);
              v38 = (char *)v38 + 4;
              v26 = ++v39 < *v25;
            }
            while ( v26 );
          }
        }
        if ( *(v23 - 7) )
        {
          v26 = *v25 <= 0;
          v39 = 0;
          if ( !v26 )
          {
            v38 = (char *)v23 - 262690;
            do
            {
              fwrite(v38, 4 * *v24, 1u, v2);
              v38 = (char *)v38 + 4096;
              v26 = ++v39 < *v25;
            }
            while ( v26 );
          }
        }
      }
      v23 += 115094;
      ++v40;
    }
    while ( v40 < (int)cANM::AnmCount );
  }
  fwrite(&cANM::ANMName, 0x28u, 1u, v2);
  fwrite(&cANM::bHALF, 1u, 1u, v2);
  fwrite(&cANM::bSAVEOUTLINE, 1u, 1u, v2);
  fwrite(&cANM::bSAVESHADOW, 1u, 1u, v2);
  fwrite(&cANM::AnmType, 4u, 1u, v2);
  fwrite(&cANM::AnmCount, 4u, 1u, v2);
  v28 = 0;
  if ( (int)cANM::AnmCount > 0 )
  {
    v29 = &dword_4B87A4;
    do
    {
      fwrite(v29 - 65685, 0x28u, 1u, v2);
      fwrite(v29, 4u, 1u, v2);
      fwrite(v29 - 2, 4u, 1u, v2);
      fwrite(v29 - 3, 4u, 1u, v2);
      fwrite(v29 - 8, 4u, 1u, v2);
      fwrite(v29 - 7, 4u, 1u, v2);
      ++v28;
      v29 += 115094;
    }
    while ( v28 < (int)cANM::AnmCount );
  }
  fwrite(&ImageFolderCount, 4u, 1u, v2);
  fwrite(&ImageFolder, 4 * ImageFolderCount + 8, 1u, v2);
  for ( i = 0; i < ImageFolderCount; ++i )
  {
    if ( strlen(cSTRINGS::GetStr(imageFOLDERS, i)) < 0x3F )
    {
      Str = cSTRINGS::GetStr(imageFOLDERS, i);
      v32 = v44;
      do
      {
        v33 = *Str;
        *v32++ = *Str++;
      }
      while ( v33 );
    }
    else
    {
      qmemcpy(v44, cSTRINGS::GetStr(imageFOLDERS, i), 0x3Fu);
      v44[63] = 0;
    }
    fwrite(v44, 0x40u, 1u, v2);
  }
  cIMG::GetMaxImage();
  SADHEADER = ftell(v2);
  v34 = regSADHEADER2;
  v35 = byte_4783AC - regSADHEADER2;
  do
  {
    v36 = *v34;
    v34[v35] = *v34;
    ++v34;
  }
  while ( v36 );
  word_4783DE = cANM::AnmCount;
  word_4783E0 = cIMG::Count;
  byte_4783E2 = cANM::AnmType;
  byte_4783E3 = l_iVersion;
  byte_4783E4 = cANM::bSAVEOUTLINE;
  byte_4783E5 = cANM::bSAVESHADOW;
  byte_4783E6 = cANM::bHALF;
  byte_4783E7 = cANM::BPP;
  word_4783D4 = cIMG::s_iMaxSpriteWidth;
  word_4783D6 = cIMG::s_iMaxSpriteHeight;
  word_4783D8 = cIMG::s_iMaxShadowWidth;
  word_4783DA = cIMG::s_iMaxShadowHeight;
  fseek(v2, 0, 0);
  fwrite(&SADHEADER, 0x40u, 1u, v2);
  fclose(v2);
  bVIRGIN = 1;
  return 1;
}
