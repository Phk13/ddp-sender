package util_test

import (
	"ddp-sender/util"
	"testing"
)

func TestDoneState_IsDone(t *testing.T) {
	// Test when done is initially false
	ds := &util.DoneState{}
	if ds.IsDone() {
		t.Errorf("IsDone() = %v, want %v", ds.IsDone(), false)
	}

	// Test after setting done to true
	ds.SetDone()
	if !ds.IsDone() {
		t.Errorf("IsDone() = %v, want %v", ds.IsDone(), true)
	}
}

func TestDoneState_SetDone(t *testing.T) {
	// Test setting done to true
	ds := &util.DoneState{}
	if ds.SetDone() != true {
		t.Errorf("SetDone() = %v, want %v", ds.SetDone(), true)
	}

	// Test that done remains true after multiple calls
	if ds.SetDone() != true {
		t.Errorf("SetDone() = %v, want %v", ds.SetDone(), true)
	}
}
