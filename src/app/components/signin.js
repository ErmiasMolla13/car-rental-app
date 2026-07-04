'use client';

import { useState } from 'react';
import {App} from 'antd';
import { Drawer, Tabs, Form, Input, Button } from 'antd';
import Link from 'next/link';

const { TabPane } = Tabs;

export default function SignIn() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const {message} = App.useApp();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const onTabChange = (key) => {
    setActiveTab(key);
  };

  const onFinishSignIn = (values) => {
    console.log('Sign In:', values);
    message.success('Sign In successful!');
    onClose();
  };

  const onFinishRegister = (values) => {
    console.log('Register:', values);
    message.success('Registration successful!');
    onClose();
  };

  return (
    <>
      <Button
        type="link"
        onClick={showDrawer}
        style={{
          color: 'white',
          border: '1px solid white',
          borderRadius: '9999px',
          backgroundColor: 'transparent'
        }}
      >
        Sign In
      </Button>


      <Drawer
        title="Welcome"
        placement="right"
        onClose={onClose}
        open={open}
        width={400}
        closable={true}
      >
        <Tabs
          defaultActiveKey="1"
          activeKey={activeTab}
          onChange={onTabChange}
          centered
        >

          <TabPane tab="Sign In" key="1">
            <Form
              form={form}
              name="signin"
              onFinish={onFinishSignIn}
              layout="vertical"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input placeholder="Enter your email" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password placeholder="Enter your password" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Sign In
                </Button>
              </Form.Item>
            </Form>
          </TabPane>


          <TabPane tab="Register" key="2">
            <Form
              form={form}
              name="register"
              onFinish={onFinishRegister}
              layout="vertical"
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <Input placeholder="Enter your full name" />
              </Form.Item>
              <Form.Item
                name="contact"
                label="Contact Number"
                rules={[
                  { required: true, message: 'Please input your contact' },
                ]}
              >
                <Input placeholder="Enter your contact number" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input placeholder="Enter your email" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' },
                ]}
              >
                <Input.Password placeholder="Enter your password" />
              </Form.Item>
              <Form.Item
                name="address"
                label="Address"
                rules={[
                  { required: true, message: 'Please input your address' },
                ]}
              >
                <Input placeholder="Enter your address" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Register
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Drawer>
    </>
  );
}