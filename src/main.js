/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
    // @TODO: Расчет выручки от операции
    // purchase — это одна из записей в поле items из чека в data.purchase_records
    // _product — это продукт из коллекции data.products
    const { discount, sale_price, quantity } = purchase;
    return sale_price * quantity * (1 - discount / 100);
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге
  // 15% — для продавца, который принёс наибольшую прибыль.
  // 10% — для продавцов, которые по прибыли находятся на втором и третьем месте.
  // 5% — для всех остальных продавцов, кроме самого последнего.
  // 0% — для продавца на последнем месте.
    if (index === 0) {
        return 0.15 * seller.profit;
    } else if (index < 3) {
        return 0.1 * seller.profit;
    } else if (index === total - 1) {
        return 0;
    } else { // Для всех остальных
        return 0.05 * seller.profit;
    }
}

// На вход главной функции нужно передать данные и две функции, которые рассчитывают бонусы и выручку. Чтобы не раздувать
// количество параметров функции, передадим функции в виде объекта настроек.
// В функциях с более чем десятью строками эти шаги есть почти всегда:
// 1. Проверить переданные данные.
// 2. Проверить нужные для работы настройки/опции/зависимости.
// 3. Собрать промежуточные данные.
// 4. Выполнить основные действия.
// 5. Сформировать итоговый ответ.
// Рекомендуем запомнить последовательность шагов: это пригодится в будущем.
/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 * выручка, топ_продуктов, бонус, название, количество_продаж, прибыль, идентификатор_продавца
 */
function analyzeSalesData(data, options) {
    // Здесь проверим входящие данные
    const { calculateRevenue, calculateBonus } = options; // Сюда передадим функции для расчётов
    // Здесь посчитаем промежуточные данные и отсортируем продавцов
    // Вызовем функцию расчёта бонуса для каждого продавца в отсортированном массиве
    // Сформируем и вернём отчёт
    // @TODO: Проверка входных данных
    // @TODO: Проверка наличия опций
    // @TODO: Подготовка промежуточных данных для сбора статистики
    // @TODO: Индексация продавцов и товаров для быстрого доступа
    // @TODO: Расчет выручки и прибыли для каждого продавца
    // @TODO: Сортировка продавцов по прибыли
    // @TODO: Назначение премий на основе ранжирования
    // @TODO: Подготовка итоговой коллекции с нужными полями
    // проверка данных массива продавцов
    data.sellers.forEach((item, index) => {
        if (!item.id || !item.first_name || !item.last_name) {
            console.error(`in array data.sellers[${index}] - required fields are missing`);
            throw 11;
        } else if (typeof(item.id) !== "string" || typeof(item.first_name) !== "string" || typeof(item.last_name) !== "string") {
            console.error(`in array data.sellers[${index}] - incorrect data`);
            console.log(item.id, item.first_name, item.last_name)
            throw 12;
        }
    })
    // проверка данных массива продуктов
    data.products.forEach((item, index) => {
        if (!item.sku || !item.purchase_price || !item.sale_price) {
            console.error(`in array data.products[${index}] - required fields are missing`);
            throw 21;
        } else if (typeof(item.sku) !== "string" || typeof(item.purchase_price) !== "number" || typeof(item.sale_price) !== "number") {
            console.error(`in array data.products[${index}] - incorrect data`);
            throw 22;
        }        
    })
    // проверка данных массива продаж
    data.purchase_records.forEach((item, index) => {
        if (!item.seller_id || !item.items || !item.total_amount) {
            console.error(`in array data.purchase_records[${index}] - required fields are missing`);
            throw 31;
        } else if (typeof(item.seller_id) !== "string" || typeof(item.items) !== "object" || typeof(item.total_amount) !== "number") {
            console.error(`in array data.purchase_records[${index}] - incorrect data`);
            throw 32;
        } else item.items.forEach((item, subIndex) => { // проверка данных подмассива проданных товаров
            if (!item.sku || !item.discount || !item.quantity || !item.sale_price) {
                console.error(`in array data.purchase_records[${index}, ${subIndex}] - required fields are missing`);
                throw 41;
            } else if (typeof(item.sku) !== "string" || typeof(item.discount) !== "number" || typeof(item.quantity) !== "number" || typeof(item.sale_price) !== "number") {
                console.error(`in array data.purchase_records[${index}, ${subIndex}] - incorrect data`);
                throw 42;
            }
        })
    })

    const sellerStats = data.sellers.map((seller) => { // Заполнение начальными данными
        return  {
            id: seller.id,
            name: `${seller.first_name} ${seller.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            products_sold: {}
        }
    });
    const sellerIndex = Object.fromEntries(sellerStats.map(item => [item.id, item])); // Ключом будет id, значением — запись из sellerStats
    const productIndex = Object.fromEntries(data.products.map(item => [item.sku, item])); // Ключом будет sku, значением — запись из data.products

    // Бизнес-логика
    data.purchase_records.forEach(record => { // Чек 
        const seller = sellerIndex[record.seller_id]; // Продавец
        seller.sales_count++; // Увеличить количество продаж
        seller.revenue += record.total_amount; // Увеличить общую сумму выручки всех продаж
        record.items.forEach(item => { // Расчёт прибыли для каждого товара
            const product = productIndex[item.sku]; // Товар
            // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
            // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
            // Посчитать прибыль: выручка минус себестоимость
            // Увеличить общую накопленную прибыль (profit) у продавца
            seller.profit += calculateRevenue(item, product) - product.purchase_price * item.quantity;
            if (!seller.products_sold[item.sku]) { // Учёт количества проданных товаров
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity; // По артикулу товара увеличить его проданное количество у продавца
        });
    });
    sellerStats.sort((a, b) => b.profit - a.profit);

    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, sellerStats.length, seller); // Считаем бонус
        seller.top_products = // Формируем топ-10 товаров
            Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({sku, quantity}))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    });

    return sellerStats.map(seller => ({
        seller_id: seller.id,                           // Строка, идентификатор продавца
        name: seller.name,                              // Строка, имя продавца
        revenue: Math.round(seller.revenue * 100) / 100,// Число с двумя знаками после точки, выручка продавца
        profit: Math.round(seller.profit * 100) / 100,  // Число с двумя знаками после точки, прибыль продавца
        sales_count: seller.sales_count,                // Целое число, количество продаж продавца
        top_products: seller.top_products,              // Массив объектов вида: { "sku": "SKU_008","quantity": 10}, топ-10 товаров продавца
        bonus: Math.round(seller.bonus * 100) / 100     // Число с двумя знаками после точки, бонус продавца
    }));
}
