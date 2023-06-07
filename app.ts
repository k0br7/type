// Определение интерфейсов
interface Product {
    id: number;
    title: string;
    price: number;
  }
  
  interface OrderItem {
    product_id: number;
    quantity: number;
  }
  
  interface ApiResponse {
    success: boolean;
    products?: Product[];
    code?: string;
  }
  
  // Получение элементов HTML
  const productSelect = document.getElementById("product-select") as HTMLSelectElement;
  const quantityInput = document.getElementById("quantity-input") as HTMLInputElement;
  const addButton = document.getElementById("add-button") as HTMLButtonElement;
  const saveButton = document.getElementById("save-button") as HTMLButtonElement;
  const orderTable = document.getElementById("order-table") as HTMLTableElement;
  const orderTotal = document.getElementById("order-total") as HTMLSpanElement;
  
  // Создание массива для хранения товаров в заказе
  let orderItems: OrderItem[] = [];
  
  // Создание функции для получения списка продукции из API
  async function getProducts() {
    try {
      // Отправка GET-запроса к API
      const response = await fetch("https://dev-su.eda1.ru/test_task/products.php");
      // Преобразование ответа в JSON
      const data: ApiResponse = await response.json();
      // Проверка успешности операции
      if (data.success) {
        // Возвращение массива продуктов
        return data.products;
      } else {
        // Вывод ошибки в консоль
        console.error("API error: failed to get products");
        // Возвращение пустого массива
        return [];
      }
    } catch (error) {
      // Обработка исключений
      console.error(error);
      return [];
    }
  }
  
  // Создание функции для заполнения select продуктами
  async function fillProductSelect() {
    // Получение списка продуктов из API
    const products = await getProducts();
    // Очистка select от старых опций
    productSelect.innerHTML = "";
    // Создание новых опций для каждого продукта
    for (const product of products) {
      // Создание элемента option
      const option = document.createElement("option");
      // Установка значения и текста опции
      option.value = product.id.toString();
      option.textContent = `${product.title} - ${product.price} руб.`;
      // Добавление опции в select
      productSelect.appendChild(option);
    }
  }
  
  // Создание функции для добавления товара в заказ
  function addOrderItem() {
    // Получение выбранного продукта из select
    const selectedProduct = productSelect.selectedOptions[0];
    // Получение введенного количества из input
    const quantity = Number(quantityInput.value);
    // Проверка корректности введенных данных
    if (selectedProduct && quantity > 0) {
      // Создание объекта товара в заказе
      const orderItem: OrderItem = {
        product_id: Number(selectedProduct.value),
        quantity: quantity,
      };
      // Добавление объекта в массив заказа
      orderItems.push(orderItem);
      // Обновление таблицы заказа
      updateOrderTable();
      // Очистка поля ввода количества
      quantityInput.value = "";
    } else {
      // Вывод сообщения об ошибке
      alert("Пожалуйста, выберите продукт и введите корректное количество");
    }
  }
  
  // Создание функции для обновления таблицы заказа
  async function updateOrderTable() {
    // Получение списка продуктов из API
    const products = await getProducts();
    // Очистка таблицы от старых строк
    orderTable.innerHTML = "";
    // Создание переменной для хранения итоговой стоимости
    let total = 0;
    // Создание новых строк для каждого товара в заказе
    for (const orderItem of orderItems) {
      // Нахождение соответствующего продукта по id
      const product = products.find((p) => p.id === orderItem.product_id);
      // Проверка наличия продукта
      if (product) {
        // Создание элемента tr
        const tr = document.createElement("tr");
        // Создание элементов td для названия, количества и стоимости товара
        const nameTd = document.createElement("td");
        nameTd.textContent = product.title;
        const quantityTd = document.createElement("td");
        quantityTd.textContent = orderItem.quantity.toString();
        const priceTd = document.createElement("td");
        priceTd.textContent = (product.price * orderItem.quantity).toString();
        // Добавление элементов td в tr
        tr.appendChild(nameTd);
        tr.appendChild(quantityTd);
        tr.appendChild(priceTd);
        // Добавление tr в таблицу
        orderTable.appendChild(tr);
        // Увеличение итоговой стоимости на стоимость товара
        total += product.price * orderItem.quantity;
      }
    }
    // Обновление элемента с итоговой стоимостью
    orderTotal.textContent = total.toString();
  }
  
  // Создание функции для сохранения заказа в API
  async function saveOrder() {
    try {
      // Проверка наличия товаров в заказе
      if (orderItems.length > 0) {
        // Отправка POST-запроса к API с телом в формате JSON
        const response = await fetch("https://dev-su.eda1.ru/test_task/save.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ products: orderItems }),
        });
        // Преобразование ответа в JSON
        const data: ApiResponse = await response.json();
        // Проверка успешности операции
        if (data.success) {
          // Вывод сообщения с номером заказа
          alert(`Заказ успешно сохранен. Номер заказа: ${data.code}`);
          // Очистка массива заказа и таблицы заказа
          orderItems = [];
          updateOrderTable();
        } else {
          // Вывод ошибки в консоль
          console.error("API error: failed to save order");
          // Вывод сообщения об ошибке
          alert("Произошла ошибка при сохранении заказа. Пожалуйста, попробуйте еще раз.");
        }
      } else {
        // Вывод сообщения об отсутствии товаров
   alert("Ваш заказ пуст. Пожалуйста, добавьте товары перед сохранением.");
      }
    } catch (error) {
      // Обработка исключений
      console.error(error);
      alert("Произошла ошибка при сохранении заказа. Пожалуйста, попробуйте еще раз.");
    }
  }
  
  // Добавление обработчиков событий для элементов HTML
  window.addEventListener("load", fillProductSelect); // Заполнение select при загрузке страницы
  addButton.addEventListener("click", addOrderItem); // Добавление товара в заказ при клике на кнопку "Добавить"
  saveButton.addEventListener("click", saveOrder); // Сохранение заказа в API при клике на кнопку "Сохранить"
