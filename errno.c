#include <stdio.h>
#include <errno.h>
#include <string.h>

int main( void )
{
    int i;
    
    for( i=0 ; i<150 ; i++ ) {
        printf( "%d %#x %s\n", i, i, strerror(i) );
    }

    return 0;
}

