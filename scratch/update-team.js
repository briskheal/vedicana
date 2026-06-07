import sequelize from '../src/lib/sequelize.js';
import DiscoverPage from '../src/models/DiscoverPage.js';

const newContent = `
<p class="lead text-lg text-gray-600 font-serif mb-8 text-center bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
  Our Business Enhancers believes in optimizing processes, leveraging technology and fostering a culture of continuous development. They engage a passionate team in the right job to bring massive success stories to VediCana. We are happy that our TEAM works like a family and they come with rich experience in our domain.
</p>

<h2 class="text-3xl font-serif text-vedicana-dark-green font-bold text-center border-b border-gray-100 pb-4 mb-8">MEMBERS</h2>

<!-- Member 1: Mr. Sishir Ranjan Mishra (Left Image) -->
<div class="img-wrap img-left">
  <img decoding="async" src="https://i0.wp.com/VediCana.com/wp-content/uploads/2024/09/Untitled-design-34.png?w=1170&amp;ssl=1" alt="Mr. Sishir Ranjan Mishra" />
  <span class="caption">Chief Advisor</span>
</div>

<h3 class="font-bold font-serif text-2xl mb-3 text-vedicana-dark-green">Mr. Sishir Ranjan Mishra</h3>
<p class="text-justify">Mr. Sishir Ranjan Mishra, is a Senior Marketing and Sales Professional with a Master in Economics from DU, MBA in Marketing &amp; Statistical Analysis from IRMA, Design Thinking from MIT, Solan carrying more than 3 decades of Industry experiences. His core focus is in Sales, Marketing, Business Development, Innovation, P&amp;L Management and Packaging Operation in FMCG (Food, Personal Care) and OTC healthcare industries. Mr. Mishra has turned around business units as well as set-up new business units with collaboration and inorganic initiatives. Have worked from scratch in launching brands with national footprints and have successfully implemented brand strategy.</p>

<p class="text-justify">As a Chief Advisor of VediCana, his strategic thinking and problem Solving, managing and developing people, innovation, insight and data based planning and decision making to minimize risk, entrepreneurial and result orientation, going to help VediCana immensely. Few amongst his many accomplishment is worth mentioning here for all of us.</p>

<h4 class="font-bold text-sm uppercase tracking-wider mt-6 mb-3 text-vedicana-dark-green">Accomplishments and Recognitions:</h4>
<ul class="list-disc pl-6 space-y-2 mb-8">
  <li>Have been awarded APZ MMB Emeritus at McCormick for successful completion of two global projects.</li>
  <li>Have been awarded Kohinoor Award of Excellence.</li>
  <li>Have been felicitated by Haw-Par, Singapore as fastest growing country and meeting business goals.</li>
  <li>CMG of the Year Asia-Pac Award for setting-up consumer healthcare division and meeting budget objectives.</li>
</ul>

<hr class="border-gray-100 my-12" />

<!-- Member 2: Mr. J. Ranjan Dash (Right Image) -->
<div class="img-wrap img-right">
  <img decoding="async" src="https://i0.wp.com/VediCana.com/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-29-at-17.43.13.jpeg?w=1170&amp;ssl=1" alt="Mr. J. Ranjan Dash" />
  <span class="caption">Founder &amp; Director</span>
</div>

<h3 class="font-bold font-serif text-2xl mb-3 text-vedicana-dark-green">Mr. J. Ranjan Dash</h3>
<p class="text-justify">Mr. J. Ranjan Dash is a veteran in industry with MBA in Marketing, having 3 decades of Industry experiences, being associated with National and Multination companies. As a Founder and Director, Mr. Dash focuses on VediCana Herbo-Nutraceuticals businesses, by improving productivity, streamlining operational issues and eliminating bottlenecks and bringing newer marketing concept into VediCana Business.</p>

<p class="text-justify">His unwavering passion for creativity and relentless pursuit to find best and economical products for consumer benefits, continue to drive VediCana business to a newer height. His mantra of success is “Build a Team, invest in cultivating their strength to make them challenge-ready”.</p>

<hr class="border-gray-100 my-12" />

<!-- Member 3: Mr. Aslam Memon (Left Image) -->
<div class="img-wrap img-left">
  <img decoding="async" src="https://i0.wp.com/VediCana.com/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-29-at-17.43.11.jpeg?w=1170&amp;ssl=1" alt="Mr. Aslam Memon" />
  <span class="caption">Marketing Head</span>
</div>

<h3 class="font-bold font-serif text-2xl mb-3 text-vedicana-dark-green">Mr. Aslam Memon</h3>
<p class="text-justify">Mr. Aslam Memon, having worked in the Sales &amp; Marketing industry for over 18 years, has developed a deep understanding of consumer behavior and market trends. As a Marketing Head, his experience in developing and executing comprehensive marketing plans has resulted in significant increases in brand awareness and customer engagement in VediCana. We are excited about his innovative approach to marketing and commitment to excellence.</p>
`;

async function main() {
  try {
    const page = await DiscoverPage.findOne({ where: { slug: 'our-team' } });
    if (!page) {
      console.log('Page not found');
    } else {
      await page.update({
        content: newContent
      });
      console.log('Successfully updated the Our Team page with redesigned layouts.');
    }
  } catch (error) {
    console.error('Error updating Our Team page:', error);
  } finally {
    await sequelize.close();
  }
}

main();
