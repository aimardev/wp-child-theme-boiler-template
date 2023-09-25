<?php
/**
 * Template Name: Template without Title
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

get_header();

while ( have_posts() ) :
	the_post();
	?>

<main id="content" <?php post_class( 'site-main' ); ?>>
	<div class="page-content">
		<?php the_content(); ?>
	</div>
</main>

	<?php
endwhile;

get_footer();
