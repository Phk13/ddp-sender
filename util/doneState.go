package util

import "sync"

type DoneState struct {
	done     bool
	doneLock sync.RWMutex
}

func (d *DoneState) IsDone() bool {
	d.doneLock.RLock()
	defer d.doneLock.RUnlock()
	return d.done
}

func (d *DoneState) SetDone() bool {
	d.doneLock.Lock()
	defer d.doneLock.Unlock()
	d.done = true
	return d.done
}
