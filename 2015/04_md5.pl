#!/usr/bin/env perl

use Digest::MD5 (md5_hex);

my $key = <DATA>;
chomp($key);

for my $n ( 1 .. 9999999 ) {
    my $hex = md5_hex($key . $n);
    if($hex =~ /^000000/) {
        print $hex, "\n";
        print $key, "\n";
        print $n, "\n";
        last;
    }
}

__DATA__
bgvyzdsv
