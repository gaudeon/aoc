#!/usr/bin/env perl

use strict;
use warnings;

use Data::Debug;
use Scalar::Util qw(weaken);

my @data = <Instructions::DATA>;
   @data = map { chomp $_; $_ } @data;

__PACKAGE__->new->run(join '', @data);
exit;

# package Main
sub new {
    my $class = shift;
    my $self  = {};

    $self->{path} = Path->new;

    my $copy = $self;
    $self->{'l'} = sub { $copy->{path}->move_left(@_); };
    $self->{'r'} = sub { $copy->{path}->move_right(@_); };
    weaken($copy);

    return bless $self, $class;
}

sub run {
    my $self         = shift;
    my $data         = shift;
    my @instructions = split(/,\s*/,$data);

    for my $instruction (@instructions) {
        my ($direction, $amount) = (substr($instruction,0,1), substr($instruction,1));
        $direction = lc $direction;
        $amount    = $amount * 1;

        next unless $direction =~ /^(?:l|r)$/ && $amount > 0;

        $self->{$direction}->($amount);
    }

    #debug $self->{path}->{trace};

    print "\nPART 1\n";

    print $self->{path}->distance, "\n";

    print "\nPART 2\n";

    my $visited_twice = $self->{path}->first_visit_by_count(2);

    #debug $visited_twice;

    print $self->{path}->distance($visited_twice), "\n";
}

# package Path
package Path;

use strict;
use warnings;

use Data::Debug;
use Scalar::Util qw(weaken);

use constant {
    DIR_NULL  => 0,
    DIR_NORTH => 1,
    DIR_EAST  => 2,
    DIR_SOUTH => 3,
    DIR_WEST  => 4,
};

sub new {
    my $self = bless {}, shift;

    $self->{trace} = []; # for debugging

    $self->{dir_to_eng} = {
        (DIR_NULL)  => "NULL",
        (DIR_NORTH) => "NORTH",
        (DIR_EAST)  => "EAST",
        (DIR_SOUTH) => "SOUTH",
        (DIR_WEST)  => "WEST",
    };

    my $copy = $self;

    # move right actions
    $self->{'right'}{(DIR_NULL)}  = sub { $copy->_move_dir(DIR_EAST, shift) };
    $self->{'right'}{(DIR_NORTH)} = sub { $copy->_move_dir(DIR_EAST, shift) };
    $self->{'right'}{(DIR_SOUTH)} = sub { $copy->_move_dir(DIR_WEST, shift) };
    $self->{'right'}{(DIR_EAST)}  = sub { $copy->_move_dir(DIR_SOUTH, shift) };
    $self->{'right'}{(DIR_WEST)}  = sub { $copy->_move_dir(DIR_NORTH, shift) };

    # move left actions
    $self->{'left'}{(DIR_NULL)}  = sub { $copy->_move_dir(DIR_WEST, shift) };
    $self->{'left'}{(DIR_NORTH)} = sub { $copy->_move_dir(DIR_WEST, shift) };
    $self->{'left'}{(DIR_SOUTH)} = sub { $copy->_move_dir(DIR_EAST, shift) };
    $self->{'left'}{(DIR_EAST)}  = sub { $copy->_move_dir(DIR_NORTH, shift) };
    $self->{'left'}{(DIR_WEST)}  = sub { $copy->_move_dir(DIR_SOUTH, shift) };

    weaken($copy);

    # Start at origin, facing north
    $self->dir(DIR_NORTH);
    $self->add_coord(0,0);

    return $self;
}

sub _move_dir {
    my $self       = shift;
    my $dir        = shift // die 'direction required';
    my $amount     = shift // die 'amount required';
    my $last_coord = $self->last_coord;
    my $orig_x     = $last_coord->x;
    my $orig_y     = $last_coord->y;
    my ($x,$y)     = ($orig_x, $orig_y);

    SWITCH: {
        $dir == DIR_NORTH && do {
            $y += abs($amount);
            last SWITCH;
        };
        $dir == DIR_SOUTH && do {
            $y -= abs($amount);
            last SWITCH;
        };
        $dir == DIR_EAST && do {
            $x += abs($amount);
            last SWITCH;
        };
        $dir == DIR_WEST && do {
            $x -= abs($amount);
            last SWITCH;
        };
    }

    push @{ $self->{trace} }, {
        called_from     => (caller(2))[3],
        current_dir     => $self->dir,
        currnet_dir_eng => $self->{dir_to_eng}->{$self->dir},
        target_dir      => $dir,
        target_dir_eng  => $self->{dir_to_eng}->{$dir},
        last_coord      => "$orig_x, $orig_y",
        target_coord    => "$x, $y",
        amount          => $amount,
    };

    $self->add_coord($x, $y);
    $self->dir($dir);
}

sub add_coord {
    my ($self, $x, $y) = @_;

    push @{$self->{coords}}, Coord->new( x => $x, y => $y);

    return $self->last_coord;
}

sub move_right {
    my $self    = shift;
    my $amount  = shift || die 'amount required';

    $self->{'right'}->{$self->dir}->($amount);
}

sub move_left {
    my $self    = shift;
    my $amount  = shift || die 'amount required';

    $self->{'left'}->{$self->dir}->($amount);
}

sub dir {
    my $self = shift;
    my $arg  = shift;

    $self->{dir} = $arg if defined $arg;

    return $self->{dir};
}

sub first_coord { shift->{coords}[0] }

sub last_coord { shift->{coords}[-1] }

sub coords { shift->{coords} }

sub distance {
    my $self        = shift;
    my $last_coord  = shift // $self->last_coord;
    my $first_coord = shift // $self->first_coord;

    $last_coord  = ref $last_coord ne 'Coord' ? $self->coords->[ $last_coord ] || $self->last_coord : $last_coord;
    $first_coord = ref $first_coord ne 'Coord' ? $self->coords->[ $first_coord ] || $self->first_coord : $first_coord;

    return abs($first_coord->x - $last_coord->x) + abs($first_coord->y - $last_coord->y);
}

sub first_visit_by_count {
    my $self    = shift;
    my $amount  = shift || 1;
    my ($first_visit_x, $first_visit_y);
    my %visited;

    return undef unless scalar @{$self->coords} > 1; # needs at least two path coords to plot

    # Build the entire path point by point until the first visited by count is found or all paths exhausted
    my $prev_coord = $self->first_coord;

    PLOTTER: for (my $i = 1; $i < @{$self->coords}; $i++) {
        my $coord       = $self->coords->[$i];
        my ($xpc, $ypc) = ($prev_coord->x, $prev_coord->y);
        my ($xc, $yc)   = ($coord->x, $coord->y);

        if ($xpc != $xc) {
            for ( my $xit = $xpc > $xc ? $xpc - 1 : $xpc + 1; $xpc > $xc ? $xit >= $xc : $xit <= $xc; $xpc > $xc ? $xit-- : $xit++ ) {
                $visited{$xit}{$yc}++;

                if ($visited{$xit}{$yc} >= $amount) {
                    ($first_visit_x, $first_visit_y) = ($xit, $yc);
                    last PLOTTER;
                }
            }
        } else {
            for ( my $yit = $ypc > $yc ? $ypc - 1 : $ypc + 1; $ypc > $yc ? $yit >= $yc : $yit <= $yc; $ypc > $yc ? $yit-- : $yit++ ) {
                $visited{$xc}{$yit}++;

                if ($visited{$xc}{$yit} >= $amount) {
                    ($first_visit_x, $first_visit_y) = ($xc, $yit);
                    last PLOTTER;
                }
            }
        }

        $prev_coord = $coord;
    }


    return defined $first_visit_x && defined $first_visit_y ? Coord->new(x => $first_visit_x, y => $first_visit_y) : undef;
}

1;

# package Coord
package Coord;

use strict;
use warnings;

use Data::Debug;

sub new {
    my $class = shift;
    my $self  = ref $_[0] eq 'HASH' ? $_[0] : { @_ };

    $self->{x} //= 0;
    $self->{y} //= 0;

    return bless $self, $class;
}

sub x {
    my $self = shift;
    my $arg  = shift;

    $self->{x} = $arg if defined $arg;

    return $self->{x};
}

sub y {
    my $self = shift;
    my $arg  = shift;

    $self->{y} = $arg if defined $arg;

    return $self->{y};
}

1;

# pacage Instructions (holds __DATA__)
package Instructions;

__DATA__
L4, L3, R1, L4, R2, R2, L1, L2, R1, R1, L3, R5, L2, R5, L4, L3, R2, R2, L5, L1, R4, L1, R3, L3, R5, R2, L5, R2, R1, R1, L5, R1, L3, L2, L5, R4, R4, L2, L1, L1, R1, R1, L185, R4, L1, L1, R5, R1, L1, L3, L2, L1, R2, R2, R2, L1, L1, R4, R5, R53, L1, R1, R78, R3, R4, L1, R5, L1, L4, R3, R3, L3, L3, R191, R4, R1, L4, L1, R3, L1, L2, R3, R2, R4, R5, R5, L3, L5, R2, R3, L1, L1, L3, R1, R4, R1, R3, R4, R4, R4, R5, R2, L5, R1, R2, R5, L3, L4, R1, L5, R1, L4, L3, R5, R5, L3, L4, L4, R2, R2, L5, R3, R1, R2, R5, L5, L3, R4, L5, R5, L3, R1, L1, R4, R4, L3, R2, R5, R1, R2, L1, R4, R1, L3, L3, L5, R2, R5, L1, L4, R3, R3, L3, R2, L5, R1, R3, L3, R2, L1, R4, R3, L4, R5, L2, L2, R5, R1, R2, L4, L4, L5, R3, L4
