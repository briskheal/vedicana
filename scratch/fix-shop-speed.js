import fs from 'fs';
import path from 'path';

function fixShopSpeed() {
  const filePath = path.join(process.cwd(), 'src/app/shop/page.js');
  let content = fs.readFileSync(filePath, 'utf-8');

  // Add unstable_cache import
  if (!content.includes("import { unstable_cache }")) {
    content = content.replace("import { Op } from 'sequelize';", "import { Op } from 'sequelize';\nimport { unstable_cache } from 'next/cache';");
  }

  // Replace the data fetching block
  const oldFetch = `  // Fetch products and categories concurrently
  const [
    { count, rows: dbProducts },
    dbCategories,
    totalProductsCount
  ] = await Promise.all([
    Product.findAndCountAll(queryOptions),
    Category.findAll(),
    Product.count()
  ]);

  const products = dbProducts.map(p => p.get({ plain: true }));
  const categories = dbCategories.map(c => c.get({ plain: true }));`;

  const newFetch = `  // Cache the database query to bypass the 9-second delay
  const getCachedData = unstable_cache(
    async (catSlug, sQuery, qLimit, qOffset) => {
      const includeCat = { model: Category, required: !!catSlug };
      if (catSlug) includeCat.where = { slug: catSlug };

      const wClause = { is_active: true };
      if (sQuery) {
        wClause[Op.or] = [
          { title: { [Op.iLike]: \`%\${sQuery}%\` } },
          { description: { [Op.iLike]: \`%\${sQuery}%\` } }
        ];
      }

      const qOpts = {
        where: wClause,
        include: [includeCat],
        order: [['createdAt', 'DESC']]
      };

      if (qLimit !== null) {
        qOpts.limit = qLimit;
        qOpts.offset = qOffset;
      }

      const [
        { count, rows: dbProducts },
        dbCategories,
        totalProductsCount
      ] = await Promise.all([
        Product.findAndCountAll(qOpts),
        Category.findAll(),
        Product.count()
      ]);

      return {
        count,
        products: JSON.parse(JSON.stringify(dbProducts.map(p => p.get({ plain: true })))),
        categories: JSON.parse(JSON.stringify(dbCategories.map(c => c.get({ plain: true })))),
        totalProductsCount
      };
    },
    [\`shop-data-\${categorySlug || 'all'}-\${searchQuery || 'none'}-\${limit || 'all'}-\${offset}\`],
    { revalidate: 3600 }
  );

  const { count, products, categories, totalProductsCount } = await getCachedData(categorySlug, searchQuery, limit, offset);`;

  content = content.replace(oldFetch, newFetch);

  // We need to remove the old queryOptions logic from outside since we moved it inside unstable_cache
  const oldQueryOptions = `  const queryOptions = {
    where: whereClause,
    include: [includeCategory],
    order: [['createdAt', 'DESC']]
  };

  if (limit !== null) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }`;

  content = content.replace(oldQueryOptions, '');

  const oldIncludeCat = `  const includeCategory = {
    model: Category,
    required: !!categorySlug,
  };
  
  if (categorySlug) {
    includeCategory.where = { slug: categorySlug };
  }

  const whereClause = { is_active: true }; // Only show active/visible products
  if (searchQuery) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: \`%\${searchQuery}%\` } },
      { description: { [Op.iLike]: \`%\${searchQuery}%\` } }
    ];
  }`;

  content = content.replace(oldIncludeCat, '');

  fs.writeFileSync(filePath, content);
  console.log("Fixed Shop Speed");
}

fixShopSpeed();
