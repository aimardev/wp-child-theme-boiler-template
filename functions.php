<?php
/**
 * Theme functions and definitions
 *
 * @package SnyderWrestling
 */

require_once __DIR__ . '/includes/class-menu.php';
require_once __DIR__ . '/includes/class-enqueue.php';
require_once __DIR__ . '/includes/class-shortcode.php';
require_once __DIR__ . '/includes/class-woocommerce.php';

( new \SnyderWrestling\Menu() )->init();
( new \SnyderWrestling\Enqueue() )->init();
( new \SnyderWrestling\Shortcode() )->init();
( new \SnyderWrestling\Woocommerce() )->init();
