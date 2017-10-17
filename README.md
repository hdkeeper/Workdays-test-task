# Сервис календаря рабочих дней

Нужно реализовать сервис, который позволяет вести календарь рабочих дней сотрудников.
Сервис представляет из себя rest api, реализация интерфейса пользователя в этом задании не требуется.

[См. workdays-test-task-v12.pdf](workdays-test-task-v12.pdf)


# Описание предметной области

Для каждого сотрудника (имя, e-mail, телефон, примечание) можно указать период, статус, долю рабочего дня и
примечание.
e-mail сотрудника уникальное поле.
Статус может принимать одно из следующих значений:

* работа на рабочем месте компании
* удаленная работа
* больничный
* отпуск

Например, сотрудник:

* брал больничный с 01.08.2017 - 10.08.2017 (10 полных рабочих дней)
* работал удаленно пол дня 11.08.2017 (пол рабочего дня)

В течении одного календарного дня сумма всех записей сотрудника не может быть больше 1 рабочего дня.

*Примечание: подразумевается, что выходные и праздничные дни никак не отличаются от рабочих дней и не должны обрабатываться специальным образом.*


# Задания

Необходимо реализовать сервис, который предоставляет api с функционалом, описанным в заданиях ниже.


## Задание 1

CRUD операции для сотрудников.

### GET /employee

Возвращает список сотрудников. Для разбиения на страницы можно использовать параметры строки запроса:

* limit - целое число, по умолчанию 100
* skip - целое число

Возвращает список объектов:

* id - строка
* name - строка
* email - строка

### GET /employee/*empId*

Возвращает детальную информацию о сотруднике:

* name - строка
* email - строка
* phone - строка
* notes - строка

### PUT /employee

Создание нового сотрудника. Параметры в теле запроса:

* name - строка, обазательное
* email - строка, обазательное
* phone - строка
* notes - строка

Возвращает объект с полем:

* id - строка

### POST /employee/*empId*

Изменение информации об имеющемся сотруднике. Параметры в теле запроса:

* name - строка
* email - строка
* phone - строка
* notes - строка

### DELETE /employee/*empId*

Удаление заданного сотрудника и весь его календарь.


## Задание 2

CRUD операции для записей календаря (кто, когда, в каком статусе).
Для списка записей должна быть возможность фильтровать записи по периоду, сотрудникам.
Список всегда возвращает в хронологическом порядке.

### GET /workday

Получение информации о днях сотрудников. Параметры строки запроса:

* employee - строка, фильтрация по сотруднику
* from - строка, формат YYYY-MM-DD, фильтрация по дате "от"
* to - строка, формат YYYY-MM-DD, фильтрация по дате "до", включительно

Разбиение на страницы:

* limit - целое число, по умолчанию 100
* skip - целое число

Возвращает список объектов:

* id - строка, идентифиватор записи дня
* status - строка
* date - строка, формат YYYY-MM-DD
* hours - целое число, необязательное
* notes - строка, необязательное
* employee - объект:
  * id - строка, идентифиватор сотрудника
  * name - строка, его имя

### PUT /employee/*empId*/workday

Создать новую запись о дне сотрудника. Параметры в теле запроса:

* status - строка, обязательное, возможные значения: work, remoteWork, sick, vacation
* date - строка, обязательное, формат YYYY-MM-DD
* hours - число, обязательно, если status = work, remoteWork
* notes - строка

Возвращает объект с полем:

* id - строка

### POST /employee/*empId*/workday/*id*

Изменить существующую запись о дне сотрудника. Параметры в теле запроса:

* employee - строка, идентифиватор сотрудника
* status - строка, возможные значения: work, remoteWork, sick, vacation
* date - строка, формат YYYY-MM-DD
* hours - число, обязательно, если status = work, remoteWork
* notes - строка

### DELETE /employee/*empId*/workday/*id*

Удаление существующей записи о дне сотрудника.


## Задание 3

Предоставление статистики.

За указанный промежуток времени, нужны данные по всем (по умолчанию все, но можно отфильтровать) сотрудникам -
количество рабочих дней по каждому статусу.
Например, в период с 01.08.2017 - 10.08.2017:

* сотрудник X брал больничный на два рабочих дня, удаленно работал 1 день, 7 дней работал на рабочем месте компании
* сотрудник Y был в отпуске все 10 дней

### GET /workday/stats

Параметры строки запроса:

* employee - строка, фильтрация по сотруднику
* from - строка, формат YYYY-MM-DD, фильтрация по дате "от"
* to - строка, формат YYYY-MM-DD, фильтрация по дате "до", включительно

Возвращает список объектов:

* employee - объект:
  * id - строка, идентифиватор сотрудника
  * name - строка, его имя
* summary - список объектов:
  * status - строка
  * count - целое число, суммарное количество дней
  * hours - целое число, суммарное количество часов


## Задание 4 (дополнительно)

При реализации списка записей календаря (задание 2) предоставить возможность эффективной выгрузки всех записей, которые имеются в бд (учитывая то, что в базе их может быть очень много).

### GET /workday/export

Параметры строки запроса:

* employee - строка, фильтрация по сотруднику
* from - строка, формат YYYY-MM-DD, фильтрация по дате "от"
* to - строка, формат YYYY-MM-DD, фильтрация по дате "до", включительно

Разбиение на страницы:

* limit - целое число, по умолчанию 100
* skip - целое число

Возвращает список объектов:

* id - строка, идентифиватор записи дня
* employee - строка, идентифиватор сотрудника
* status - строка
* date - строка, формат YYYY-MM-DD
* hours - целое число, необязательное
* notes - строка, необязательное


## Задание 5 (дополнительно)

Импорт записей из внешнего json-файла.
Файл содержит записи вида:

```
{"name":"Delfina Volkman","email":"delfina_volkman1979@example.com","date":"01.01.2001","status":"work"}
```

При этом каждая импортируемая запись занимает полный рабочий день.
Подразумевается, что импорт будет производиться периодически и файл может быть большого размера (сотни тысяч записей).

*Примечание: именование полей внешнего файла не накладывает никакие обязательства на именования и структуру полей в бд и api.*

### importData.js

Использование:

```
node importData.js data/workdays-testdata-04082017.json.gz
```
