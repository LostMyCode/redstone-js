#include <iostream>

#include <limits>

using namespace std;

class BasicTest1 {
  public: byte b0;
  byte b1;
  byte b2;
  byte b3;
  byte b4;
  byte b5;
  byte b6;
  byte b7;

  BasicTest1() {
    *((unsigned short * ) this + 0) = 3;
    *((unsigned int * ) this + 1) = 123123123;
    printf("compare address?: %d %d", (unsigned short * ) this, (unsigned long * ) this);
    printf("\n");
    printf("check value %d %d %d %d %d %d %d %d", b0, b1, b2, b3, b4, b5, b6, b7);
  }
};

int main(void) {
  // Your code here!
  BasicTest1 test1;
}