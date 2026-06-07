import sequelize from '../src/lib/sequelize.js';
import DiscoverPage from '../src/models/DiscoverPage.js';

const newContent = `
<blockquote>
  “At VediCana Organics, we are committed to creating a positive impact on society and the environment. Our CSR and philanthropic efforts reflect our dedication to sustainable business practices and giving back to the communities we serve.”
</blockquote>

<div class="img-wrap img-center">
  <img loading="lazy" decoding="async" src="https://i0.wp.com/VediCana.com/wp-content/uploads/2021/12/Social-responsiblity.png?fit=555%2C376&amp;ssl=1" alt="Social responsibility hero image" />
  <span class="caption">Our dedication to sustainable, ethical, and organic practices</span>
</div>

<div class="img-wrap img-left">
  <img loading="lazy" decoding="async" src="https://i0.wp.com/VediCana.com/wp-content/uploads/2024/08/father-his-three-daughters-plant-small-tree-together_14117-918138.jpg?fit=626%2C351&amp;ssl=1" alt="Father and daughters planting a tree" />
  <span class="caption">Nurturing nature: planting saplings for a greener future</span>
</div>

<h3 class="banner-title text-left">Environmental Sustainability</h3>
<ul>
  <li><strong>Carbon Footprint Reduction</strong>: We strive to reduce our greenhouse gas emissions through energy-efficient practices and renewable energy sources.</li>
  <li><strong>Recycling Programs</strong>: VediCana Organics has implemented comprehensive recycling initiatives across all our facilities.</li>
  <li><strong>Sustainable Materials</strong>: We prioritize sourcing and using sustainable, organic materials in our products.</li>
</ul>

<div class="img-wrap img-right">
  <img loading="lazy" decoding="async" src="https://i0.wp.com/VediCana.com/wp-content/uploads/2024/08/medium-shot-people-working-together_23-2149411549.jpg?fit=626%2C417&amp;ssl=1" alt="Team working together" />
  <span class="caption">A diverse, safe, and collaborative workplace</span>
</div>

<h3 class="banner-title text-left">Ethical Labor Practices</h3>
<ul>
  <li><strong>Fair Wages:</strong> We ensure fair compensation for all our employees, adhering to ethical labor standards.</li>
  <li><strong>Safe Working Conditions:</strong> Our facilities maintain high safety standards to provide a secure working environment.</li>
  <li><strong>Diversity and Inclusion:</strong> VediCana Organics promotes a diverse and inclusive workplace, fostering a culture of equality and respect.</li>
</ul>

<h3 class="banner-title text-center">Philanthropic Efforts</h3>

<div class="img-wrap img-left">
  <img loading="lazy" decoding="async" src="https://i0.wp.com/VediCana.com/wp-content/uploads/2024/08/volunteer-giving-box-with-donations-another-volunteer_23-2149230558.jpg?fit=626%2C417&amp;ssl=1" alt="Donation box and volunteers" />
  <span class="caption">Giving back: supporting non-profit efforts and community aid</span>
</div>

<h3 class="banner-title text-left">Donations</h3>
<ul>
  <li><strong>Financial Contributions</strong>: We support various non-profit organizations focused on health, education, and environmental conservation.</li>
  <li><strong>In-kind Donations</strong>: VediCana Organics donates products and services to communities in need.</li>
</ul>

<div class="img-wrap img-right">
  <img loading="lazy" decoding="async" src="https://i0.wp.com/VediCana.com/wp-content/uploads/2024/08/portrait-confident-environmentalists_13339-34163.jpg?fit=626%2C417&amp;ssl=1" alt="Confident volunteers" />
  <span class="caption">Empowering employees to make a difference locally</span>
</div>

<h3 class="banner-title text-left">Volunteer Programs</h3>
<ul>
  <li><strong>Employee Volunteering</strong>: Our employees regularly volunteer their time and skills to support local charities and community projects.</li>
  <li><strong>Community Service Days</strong>: We organize company-wide community service days to encourage collective action and social engagement.</li>
</ul>

<h3 class="banner-title text-left">Community Programs</h3>
<ul>
  <li><strong>Local Sponsorships</strong>: VediCana Organics sponsors local events and initiatives that promote sustainability and community well-being.</li>
  <li><strong>Educational Support</strong>: We provide scholarships and educational resources to support the next generation of leaders and innovators.</li>
</ul>

<h3 class="banner-title text-left">Impact Stories</h3>
<p>Through our partnership with <strong>Emyris Foundation</strong>, we have created awareness on organ donation across more than 20 schools in our society.</p>
<p>Additionally, we have helped provide clean drinking water to over 10,000 people in rural areas. Last year alone, our employees volunteered over 500 hours to support local schools and community centers, making a significant difference in the lives of many.</p>

<h3 class="banner-title text-left">Future Goals</h3>
<p>We are committed to further reducing our environmental impact and aim to achieve zero waste in our operations by 2030. Additionally, we plan to increase our charitable donations by 20% over the next five years.</p>

<h3 class="banner-title text-left">How to Get Involved</h3>
<p>Join us in making a difference. Learn more about our volunteer opportunities and how you can contribute to the causes we support. Together, we can create a better future.</p>

<h3 class="banner-title text-left">Contact Information</h3>
<p>For more information about our CSR and philanthropic initiatives, please contact <strong>J.R. Dash</strong> at <a href="mailto:emyrisfoundation@gmail.com">emyrisfoundation@gmail.com</a> or <a href="tel:+918878923337">+91 88789 23337</a>.</p>
`;

async function main() {
  try {
    const [page, created] = await DiscoverPage.findOrCreate({
      where: { slug: 'csr-and-philanthropy' },
      defaults: {
        title: 'CSR & Philanthropy',
        content: newContent,
        is_active: true
      }
    });

    if (!created) {
      await page.update({
        content: newContent
      });
      console.log('Successfully updated the CSR page with redesigned layouts.');
    } else {
      console.log('Successfully created the CSR page with redesigned layouts.');
    }
  } catch (error) {
    console.error('Error updating CSR page:', error);
  } finally {
    await sequelize.close();
  }
}

main();
