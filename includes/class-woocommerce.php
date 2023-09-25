<?php

/**
 * Woocommerce related functions
 *
 * @package SnyderWrestling
 */

namespace SnyderWrestling;

class Woocommerce {
	public function init() {

		add_action('init', array($this, 'init_hook'));
	}
	public function init_hook() {
	}
}
