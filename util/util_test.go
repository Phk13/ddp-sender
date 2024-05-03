package util_test

import (
	"ddp-sender/util"
	"reflect"
	"testing"
)

func TestMakeRange(t *testing.T) {
	tests := []struct {
		name   string
		first  int
		last   int
		step   int
		expect []int
	}{
		{
			name:   "Basic range",
			first:  1,
			last:   5,
			step:   1,
			expect: []int{1, 2, 3, 4, 5},
		},
		{
			name:   "Step greater than 1",
			first:  1,
			last:   10,
			step:   2,
			expect: []int{1, 3, 5, 7, 9},
		},
		{
			name:   "Step greater than last",
			first:  1,
			last:   5,
			step:   10,
			expect: []int{1},
		},
		{
			name:   "Negative step",
			first:  5,
			last:   1,
			step:   -1,
			expect: []int{5, 4, 3, 2, 1},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := util.MakeRange(tt.first, tt.last, tt.step)
			if !reflect.DeepEqual(result, tt.expect) {
				t.Errorf("MakeRange() = %v, want %v", result, tt.expect)
			}
		})
	}
}
