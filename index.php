<?php
get_header();

while (have_posts()) :
	the_post();
?>

	<main id="content" <?php post_class('site-main'); ?>>
		<div class="page-title">
			<?php the_title('<h1 class="entry-title">', '</h1>'); ?>
		</div>
		<div class="page-content">
			<?php the_content(); ?>
			<div class="post-tags">
				<?php the_tags('<span class="tag-links">' . esc_html__('Tagged ', 'wrestling'), null, '</span>'); ?>
			</div>
			<?php wp_link_pages(); ?>
		</div>

		<?php comments_template(); ?>
	</main>

<?php
endwhile;

get_footer();
