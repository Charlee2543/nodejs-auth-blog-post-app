export const userSchemaValidation = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "password", "firstName", "lastName"],
      properties: {
        username: {
          bsonType: "string",
          description: "ชื่อผู้ใช้งาน"
        },
        password: {
          bsonType: "string",
          description: "รหัสผ่าน"
        },
        firstName: {
          bsonType: "string",
          description: "ชื่อจริง"
        },
        lastName: {
          bsonType: "string",
          description: "นามสกุล"
        },
        role: {
          bsonType: "string",
          enum: ["user", "admin"],
          description: "บทบาทผู้ใช้งาน"
        },
        createdAt: {
          bsonType: "date",
          description: "วันที่สร้างบัญชี"
        }
      }
    }
  }
}; 