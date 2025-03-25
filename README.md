# Vefforritun 2 2025, verkefni 3 sýnilausn

Verekfnið sem hér var unnið er einskonar Blogg/frétta/artice síða. Hér getur notandi birt article, gert comment ofr. 

ADMIN: username: olafur password: osk

### **Authentication**
| Method | Endpoint  | Description |
|--------|----------|-------------|
| `POST` | `/auth/login`  | User login |
| `POST` | `/auth/register`  | User register |


### **Users**
| Method  | Endpoint         | Description |
|---------|-----------------|-------------|
| `GET`   | `/users`        | Fetch all users |
| `POST`  | `/users`        | Create a new user |
| `GET`   | `/users/:userId` | Get user details |
| `PATCH` | `/users/:userId` | Update user details |
| `DELETE`| `/users/:userId` | Delete user |

### **Articles**
| Method  | Endpoint               | Description |
|---------|------------------------|-------------|
| `GET`   | `/articles`             | Fetch all articles |
| `POST`  | `/articles`             | Create a new article |
| `GET`   | `/articles/:articleId`  | Get article details |
| `PATCH` | `/articles/:articleId`  | Update an article |
| `DELETE`| `/articles/:articleId`  | Delete an article |

### **Categories**
| Method  | Endpoint                     | Description |
|---------|------------------------------|-------------|
| `GET`   | `/categories`                 | Fetch all categories |
| `POST`  | `/categories`                 | Create a new category |
| `GET`   | `/categories/:categoryId/articles` | Get articles by category |
| `PATCH` | `/categories/:categoryId`     | Update category details |

### **Comments**
| Method  | Endpoint                          | Description |
|---------|-----------------------------------|-------------|
| `GET`   | `/comments/:articleId`            | Fetch comments for an article |
| `GET`   | `/comments/users/:userId/comments`| Fetch comments by a user |
| `POST`  | `/comments`                        | Create a new comment |
| `DELETE`| `/comments/:commentId`             | Delete a comment |

### **Tags**
| Method  | Endpoint                  | Description |
|---------|---------------------------|-------------|
| `GET`   | `/tags`                     | Fetch all tags |
| `POST`  | `/tags`                     | Create a new tag |
| `GET`   | `/tags/:tagName/articles`   | Get articles by tag |

Óauðkenndur notandi getur einungis notast við get skipanir, notandi getur postað og patch/eytt sínum commentum. Admin getur gert allt við allt.

BTW: (Örlítil hjálp ver fengin frá Hr. Chat GPT þegar við vorum í vandræðum)