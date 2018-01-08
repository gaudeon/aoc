#!/usr/bin/env perl

use strict;
use warnings;

use Data::Debug;
use Digest::MD5 qw(md5 md5_hex md5_base64);

my @data = <Instructions::DATA>;
   @data = map { chomp $_; $_ } @data;

__PACKAGE__->new->run(@data);
exit;

# package Main
sub new {
    my $class = shift;
    my $self  = {};

    return bless $self, $class;
}

sub run {
    my $self  = shift;
    my @data  = @_;

    my $door_id = shift @data;
    chomp $door_id;

    my $pwh = {};
    my $inc = 0;

    print "Decrypting $door_id...\n";

    while (scalar(keys %$pwh) < 8) {

        my $hash = md5_hex($door_id . $inc);

        if ($hash =~ /^[0]{5}([0-7])(\w)/) {
            $pwh->{$1} = $2 if ! exists $pwh->{$1};
        }

        $inc++;
    }

    my $pw = '';
    $pw .= $pwh->{$_} for sort keys %$pwh;

    print $pw, "\n";
}

package Instructions;

__DATA__
cxdnnyjw
