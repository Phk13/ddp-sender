package util

func MakeRange(first, last, step int) []int {
	var slice []int
	if step > 0 {
		for i := first; i < last; i += step {
			slice = append(slice, i)
		}
	} else if step < 0 {
		for i := first; i > last; i += step {
			slice = append(slice, i)
		}
	}
	return slice
}
